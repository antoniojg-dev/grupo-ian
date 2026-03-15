import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendRecordatorioPago } from '@/server/emails/send-email'

export async function POST(req: NextRequest) {
  // Verificar autorización del cron job
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const now = new Date()
  const mesAnterior = now.getMonth() === 0 ? 12 : now.getMonth()
  const anioAnterior = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()

  // Buscar pagos pendientes del mes anterior con datos del padre y alumno
  const { data: pagos, error } = await supabase
    .from('pagos')
    .select(`
      id,
      monto_final,
      periodo_mes,
      periodo_anio,
      paid_at,
      alumnos (nombre, apellido),
      perfiles (nombre, email)
    `)
    .eq('estado', 'pendiente')
    .eq('periodo_mes', mesAnterior)
    .eq('periodo_anio', anioAnterior)

  if (error) {
    console.error('[recordatorio] Error consultando pagos:', error)
    return NextResponse.json({ error: 'Error consultando pagos' }, { status: 500 })
  }

  if (!pagos || pagos.length === 0) {
    return NextResponse.json({ enviados: 0 })
  }

  let enviados = 0

  for (const pago of pagos) {
    const perfil = pago.perfiles as unknown as { nombre: string; email: string } | null
    const alumno = pago.alumnos as unknown as { nombre: string; apellido: string } | null

    if (!perfil?.email || !alumno) continue

    // Calcular días vencidos (desde día 10 del mes correspondiente)
    const fechaVencimiento = new Date(pago.periodo_anio, pago.periodo_mes - 1, 10)
    const diasVencido = Math.max(
      0,
      Math.floor((now.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24))
    )

    try {
      await sendRecordatorioPago({
        to: perfil.email,
        nombrePadre: perfil.nombre,
        nombreAlumno: `${alumno.nombre} ${alumno.apellido}`,
        montoPendiente: pago.monto_final,
        diasVencido,
      })
      enviados++
    } catch (err) {
      console.error(`[recordatorio] Error enviando a ${perfil.email}:`, err)
    }
  }

  return NextResponse.json({ enviados })
}
