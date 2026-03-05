import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

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
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as import('stripe').Stripe.PaymentIntent
      const { alumnoId, servicioId, padreId, mes, anio, cuponId } = intent.metadata

      // Buscar el pago por stripe_payment_intent_id
      const { data: pago } = await supabase
        .from('pagos')
        .select('id')
        .eq('stripe_payment_intent_id', intent.id)
        .single()

      if (!pago) {
        console.error('[webhook] Pago no encontrado para intent:', intent.id)
        return NextResponse.json({ received: true })
      }

      // Generar folio via función SQL
      const { data: folio, error: folioErr } = await supabase.rpc('generar_folio', {
        p_anio: new Date().getFullYear(),
      })
      if (folioErr) {
        console.error('[webhook] Error generando folio:', folioErr)
        return NextResponse.json({ received: true })
      }

      // Actualizar pago a pagado
      await supabase
        .from('pagos')
        .update({
          estado: 'pagado',
          paid_at: new Date().toISOString(),
          folio,
        })
        .eq('id', pago.id)

      // Incrementar usos del cupón si aplica
      if (cuponId) {
        await supabase.rpc('incrementar_usos_cupon', { cupon_id: cuponId })
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
