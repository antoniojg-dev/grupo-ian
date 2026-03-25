import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { generateAndSaveReceipt } from '@/server/pdf/generate-receipt'
import { sendConfirmacionPago } from '@/server/emails/send-email'

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
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as import('stripe').Stripe.PaymentIntent
      const { cuponId } = intent.metadata

      // Paso 1: Buscar solo el pago
      const { data: pago, error: pagoErr } = await supabase
        .from('pagos')
        .select('id, alumno_id, servicio_id, padre_id, monto_final, periodo_mes, periodo_anio')
        .eq('stripe_payment_intent_id', intent.id)
        .single()

      if (pagoErr || !pago) {
        console.error('[webhook] Pago no encontrado')
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

      // Incrementar usos del cupón si aplica
      if (cuponId) {
        await supabase.rpc('incrementar_usos_cupon', { cupon_id: cuponId })
      }

      // Generar PDF
      try {
        await generateAndSaveReceipt(pago.id)
      } catch (pdfErr) {
        console.error('[webhook] PDF error:', pdfErr)
      }

      // Enviar email de confirmación
      if (perfil?.email && alumno && servicio) {
        const periodoLabel = `${new Date(0, (pago.periodo_mes ?? 1) - 1).toLocaleString('es-MX', { month: 'long' })} ${pago.periodo_anio ?? new Date().getFullYear()}`
        try {
          await sendConfirmacionPago({
            to: perfil.email,
            nombrePadre: perfil.nombre,
            nombreAlumno: `${alumno.nombre} ${alumno.apellido}`,
            folio,
            concepto: servicio.nombre,
            periodo: periodoLabel,
            montoFinal: pago.monto_final,
          })
        } catch (err) {
          console.error('[webhook] Email error:', err)
        }
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

    if (event.type === 'invoice.payment_succeeded') {
      // Stripe Invoice puede tener campo `subscription` en eventos de factura de suscripción
      const invoice = event.data.object as { subscription?: string | null }
      const subscriptionId = invoice.subscription ?? null
      if (subscriptionId) {
        await supabase
          .from('semillas_suscripciones')
          .update({ status: 'activa', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscriptionId)
          .eq('status', 'pago_fallido')
        console.log(`[webhook] Semillas pago exitoso: ${subscriptionId}`)
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as { subscription?: string | null }
      const subscriptionId = invoice.subscription ?? null
      if (subscriptionId) {
        await supabase
          .from('semillas_suscripciones')
          .update({ status: 'pago_fallido', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscriptionId)
        console.log(`[webhook] Semillas pago fallido: ${subscriptionId}`)
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as import('stripe').Stripe.Subscription
      await supabase
        .from('semillas_suscripciones')
        .update({
          status: 'cancelada',
          fecha_cancelacion: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)
      console.log(`[webhook] Semillas cancelada: ${subscription.id}`)
    }
  } catch (err) {
    console.error('[webhook] Error procesando evento:', err)
  }

  // Siempre retornar 200 para que Stripe no reintente
  return NextResponse.json({ received: true })
}
