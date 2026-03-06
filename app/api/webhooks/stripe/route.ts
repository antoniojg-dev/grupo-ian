import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { generateAndSaveReceipt } from '@/server/pdf/generate-receipt'
import { sendConfirmacionPago } from '@/server/emails/send-email'

// Supabase con service role para bypassear RLS en el webhook
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Sin firma Stripe' }, { status: 400 })
  }

  let event: import('stripe').Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] Firma inválida:', err)
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    console.log('1. Evento recibido:', event.type)

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as import('stripe').Stripe.PaymentIntent
      const { alumnoId, servicioId, padreId, mes, anio, cuponId } = intent.metadata

      console.log('2. PaymentIntent ID:', intent.id)

      // Paso 1: Buscar solo el pago
      const { data: pago, error: pagoErr } = await supabase
        .from('pagos')
        .select('id, alumno_id, servicio_id, padre_id, monto_final, periodo_mes, periodo_anio')
        .eq('stripe_payment_intent_id', intent.id)
        .single()

      console.log('3. Query resultado:', { pago, pagoErr })

      if (pagoErr || !pago) {
        console.error('[webhook] Pago no encontrado para intent:', intent.id, pagoErr)
        return NextResponse.json({ received: true })
      }

      // Paso 2: Buscar datos adicionales para email y PDF
      const [{ data: alumno }, { data: servicio }, { data: perfil }] = await Promise.all([
        supabase
          .from('alumnos')
          .select('nombre, apellido')
          .eq('id', pago.alumno_id)
          .single(),
        supabase
          .from('servicios')
          .select('nombre')
          .eq('id', pago.servicio_id)
          .single(),
        supabase
          .from('perfiles')
          .select('nombre, email')
          .eq('id', pago.padre_id)
          .single(),
      ])

      // Generar folio via función SQL
      const { data: folio, error: folioErr } = await supabase.rpc('generar_folio', {
        p_anio: new Date().getFullYear(),
      })
      if (folioErr) {
        console.error('[webhook] Error generando folio:', folioErr)
        return NextResponse.json({ received: true })
      }

      // Actualizar pago a pagado
      const { data: updateData, error: updateErr } = await supabase
        .from('pagos')
        .update({
          estado: 'pagado',
          paid_at: new Date().toISOString(),
          folio,
        })
        .eq('stripe_payment_intent_id', intent.id)
        .select()

      console.log('4. Update resultado:', { updateData, updateErr })
      console.log('5. Filas actualizadas:', updateData)
      if (updateErr) console.error('Update error:', updateErr)

      // Incrementar usos del cupón si aplica
      if (cuponId) {
        await supabase.rpc('incrementar_usos_cupon', { cupon_id: cuponId })
      }

      // Generar PDF en background (no bloquear el webhook)
      generateAndSaveReceipt(pago.id).catch((err) =>
        console.error('[webhook] Error generando PDF:', err)
      )

      // Enviar email de confirmación en background
      console.log('[webhook] Resend config:', {
        hasApiKey: !!process.env.RESEND_API_KEY,
        fromEmail: process.env.RESEND_FROM_EMAIL,
      })
      console.log('[webhook] Intentando enviar email a:', perfil?.email)
      if (perfil?.email && alumno && servicio) {
        const periodoLabel = `${new Date(0, (pago.periodo_mes ?? 1) - 1).toLocaleString('es-MX', { month: 'long' })} ${pago.periodo_anio ?? new Date().getFullYear()}`
        sendConfirmacionPago({
          to: perfil.email,
          nombrePadre: perfil.nombre,
          nombreAlumno: `${alumno.nombre} ${alumno.apellido}`,
          folio,
          concepto: servicio.nombre,
          periodo: periodoLabel,
          montoFinal: pago.monto_final,
        })
          .then((result) => console.log('[webhook] Email resultado:', JSON.stringify(result)))
          .catch((err) => console.error('[webhook] Email error:', err.message))
      } else {
        console.warn('[webhook] Email omitido — perfil:', perfil, 'alumno:', alumno, 'servicio:', servicio)
      }

      console.log(`[webhook] Pago ${pago.id} confirmado — folio ${folio}`)
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as import('stripe').Stripe.PaymentIntent

      // El pago falla pero no se marca vencido todavía — se deja en pendiente
      await supabase
        .from('pagos')
        .update({ estado: 'pendiente' })
        .eq('stripe_payment_intent_id', intent.id)

      console.log(`[webhook] Pago fallido para intent: ${intent.id}`)
    }
  } catch (err) {
    console.error('[webhook] Error procesando evento:', err)
  }

  // Siempre retornar 200 para que Stripe no reintente
  return NextResponse.json({ received: true })
}
