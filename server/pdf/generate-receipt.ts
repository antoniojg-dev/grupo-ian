import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@supabase/supabase-js'
import { ReceiptTemplate, ReceiptData } from './receipt-template'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function formatPeriodo(mes: number, anio: number): string {
  return `${MESES[mes - 1]} ${anio}`
}

export function centavosAPesos(centavos: number): string {
  const formatted = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(centavos / 100)
  return `$${formatted} MXN`
}

function formatMetodo(metodo: string | null): string {
  switch (metodo) {
    case 'efectivo': return 'Efectivo'
    case 'transferencia': return 'Transferencia'
    case 'caja': return 'Caja'
    default: return 'Tarjeta'
  }
}

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Genera el PDF de recibo para un pago, lo sube a Supabase Storage
 * y actualiza pdf_url en la tabla pagos.
 * Si el pago ya tiene pdf_url, retorna la URL existente sin regenerar.
 */
export async function generateAndSaveReceipt(pagoId: string): Promise<string> {
  const adminSupabase = createAdminClient()

  // 1. Obtener datos del pago
  const { data: pago, error: pagoErr } = await adminSupabase
    .from('pagos')
    .select('*')
    .eq('id', pagoId)
    .single()

  if (pagoErr || !pago) {
    throw new Error(`Pago no encontrado: ${pagoId}`)
  }

  // Si ya tiene pdf_url, no regenerar
  if (pago.pdf_url) {
    return pago.pdf_url as string
  }

  if (!pago.folio) {
    throw new Error('El pago no tiene folio asignado — no se puede generar recibo')
  }

  // 2. Obtener alumno
  const { data: alumno } = await adminSupabase
    .from('alumnos')
    .select('nombre, apellido, grado, beca_porcentaje, padre_id')
    .eq('id', pago.alumno_id)
    .single()

  if (!alumno) throw new Error(`Alumno no encontrado: ${pago.alumno_id}`)

  // 3. Obtener servicio
  const { data: servicio } = await adminSupabase
    .from('servicios')
    .select('nombre')
    .eq('id', pago.servicio_id)
    .single()

  // 4. Obtener datos del padre
  let padreNombre = ''
  let padreEmail = ''
  const padreId: string | null = pago.padre_id ?? alumno.padre_id ?? null

  if (padreId) {
    const { data: perfil } = await adminSupabase
      .from('perfiles')
      .select('nombre, apellido')
      .eq('id', padreId)
      .single()

    if (perfil) {
      padreNombre = `${perfil.nombre ?? ''} ${perfil.apellido ?? ''}`.trim()
    }

    const { data: { user } } = await adminSupabase.auth.admin.getUserById(padreId)
    padreEmail = user?.email ?? ''
  }

  // 5. Construir ReceiptData
  const receiptData: ReceiptData = {
    folio: pago.folio as string,
    fechaPago: pago.paid_at ? new Date(pago.paid_at) : new Date(pago.created_at),
    metodoPago: formatMetodo(pago.metodo_pago),
    alumnoNombre: alumno.nombre,
    alumnoApellido: alumno.apellido,
    grado: alumno.grado,
    becaPorcentaje: alumno.beca_porcentaje ?? 0,
    concepto: servicio?.nombre ?? 'Pago',
    periodo: pago.periodo_mes && pago.periodo_anio
      ? formatPeriodo(pago.periodo_mes, pago.periodo_anio)
      : '—',
    montoOriginal: pago.monto_original,
    descuentoBeca: pago.descuento_beca ?? 0,
    descuentoCupon: pago.descuento_cupon ?? 0,
    montoFinal: pago.monto_final,
    padreNombre,
    padreEmail,
  }

  // 6. Generar PDF
  const buffer = await renderToBuffer(
    React.createElement(ReceiptTemplate, { data: receiptData })
  )

  // 7. Subir a Supabase Storage: recibos/{padre_id}/{folio}.pdf
  const storagePath = `${padreId ?? 'sin-padre'}/${pago.folio}.pdf`

  const { error: uploadErr } = await adminSupabase.storage
    .from('recibos')
    .upload(storagePath, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadErr) {
    throw new Error(`Error subiendo PDF a Storage: ${uploadErr.message}`)
  }

  // 8. Obtener URL firmada (expira en 1 año)
  const { data: signedData, error: signedErr } = await adminSupabase.storage
    .from('recibos')
    .createSignedUrl(storagePath, 31_536_000)

  if (signedErr || !signedData?.signedUrl) {
    throw new Error(`Error obteniendo URL firmada: ${signedErr?.message}`)
  }

  const pdfUrl = signedData.signedUrl

  // 9. Actualizar pdf_url en la tabla pagos
  await adminSupabase
    .from('pagos')
    .update({ pdf_url: pdfUrl })
    .eq('id', pagoId)

  return pdfUrl
}
