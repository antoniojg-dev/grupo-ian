import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient as createAdminClientRaw } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { buildPaymentData } from '@/server/payments/process-payment'
import { generateAndSaveReceipt } from '@/server/pdf/generate-receipt'
import { Alumno, Servicio } from '@/types'
import { Cupon } from '@/server/payments/apply-coupon'

const schema = z.object({
  alumnoId: z.string().uuid(),
  servicioId: z.string().uuid(),
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020),
  metodo: z.enum(['efectivo', 'transferencia', 'caja']),
  referencia: z.string().optional(),
  cuponCodigo: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // Verificar rol admin
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single()
    if (!perfil || perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden registrar pagos manuales' }, { status: 403 })
    }

    // Validar input
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.issues },
        { status: 400 }
      )
    }
    const { alumnoId, servicioId, mes, anio, metodo, referencia, cuponCodigo } = parsed.data

    // Usar service role para bypassear RLS (admin registra pagos de cualquier alumno)
    const adminSupabase = createAdminClientRaw(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Obtener alumno
    const { data: alumno, error: alumnoErr } = await adminSupabase
      .from('alumnos')
      .select('*')
      .eq('id', alumnoId)
      .single()
    if (alumnoErr || !alumno) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    }

    // Obtener servicio
    const { data: servicio, error: servicioErr } = await adminSupabase
      .from('servicios')
      .select('*')
      .eq('id', servicioId)
      .single()
    if (servicioErr || !servicio) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    // Obtener congelaciones
    const { data: congelaciones } = await adminSupabase
      .from('alumno_congelaciones')
      .select('alumno_id, mes, anio')
      .eq('alumno_id', alumnoId)

    // Obtener cupón si se proporcionó
    let cupon: Cupon | undefined = undefined
    let cuponId: string | undefined = undefined
    if (cuponCodigo) {
      const { data: cuponData } = await adminSupabase
        .from('cupones')
        .select('*')
        .eq('codigo', cuponCodigo.toUpperCase())
        .single()
      if (!cuponData) {
        return NextResponse.json({ error: 'Cupón no encontrado o inválido' }, { status: 400 })
      }
      cupon = cuponData as Cupon
      cuponId = cuponData.id
    }

    // Construir datos de pago
    const paymentData = buildPaymentData({
      alumno: alumno as Alumno,
      servicio: servicio as Servicio,
      cupon,
      mes,
      anio,
      congelaciones: congelaciones ?? [],
    })

    if (!paymentData.valido) {
      return NextResponse.json({ error: paymentData.error }, { status: 400 })
    }

    // Generar folio
    const { data: folio, error: folioErr } = await adminSupabase.rpc('generar_folio', {
      p_anio: new Date().getFullYear(),
    })
    if (folioErr) {
      return NextResponse.json({ error: 'Error generando folio' }, { status: 500 })
    }

    // Insertar pago como pagado
    const { data: nuevoPago, error: insertErr } = await adminSupabase.from('pagos').insert({
      alumno_id: alumnoId,
      servicio_id: servicioId,
      padre_id: alumno.padre_id ?? null,
      monto_original: paymentData.montoOriginal,
      descuento_beca: paymentData.descuentoBeca,
      descuento_cupon: paymentData.descuentoCupon,
      monto_final: paymentData.montoFinal,
      periodo_mes: mes,
      periodo_anio: anio,
      estado: 'pagado',
      metodo_pago: metodo,
      folio,
      cupon_id: cuponId ?? null,
      paid_at: new Date().toISOString(),
      referencia: referencia ?? null,
    }).select('id').single()

    if (insertErr) {
      console.error('[pagos/manual]', insertErr)
      return NextResponse.json({ error: 'Error al guardar el pago' }, { status: 500 })
    }

    // Incrementar usos del cupón si aplica
    if (cuponId) {
      await adminSupabase.rpc('incrementar_usos_cupon', { cupon_id: cuponId })
    }

    // Generar PDF en background (no bloquear la respuesta)
    if (nuevoPago?.id) {
      generateAndSaveReceipt(nuevoPago.id).catch((err) =>
        console.error('[pagos/manual] Error generando PDF:', err)
      )
    }

    return NextResponse.json({ folio, monto: paymentData.montoFinal })
  } catch (err) {
    console.error('[pagos/manual]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
