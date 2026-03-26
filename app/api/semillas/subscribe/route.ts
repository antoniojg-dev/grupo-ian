import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { SEMILLAS_PRICES } from '@/config/constants'
import { getSuscripcionByAlumno } from '@/services/semillas'
import { SemillasPaquete } from '@/types'

const schema = z.object({
  alumnoId: z.string().uuid(),
  paquete: z.enum(['siembra', 'crece', 'florece']),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol, nombre, apellido, email')
      .eq('id', user.id)
      .single()

    if (!perfil || perfil.rol !== 'padre') {
      return NextResponse.json({ error: 'Solo padres pueden suscribirse' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.issues },
        { status: 400 }
      )
    }
    const { alumnoId, paquete } = parsed.data

    // Verificar que el alumno pertenece al padre
    const { data: alumno, error: alumnoErr } = await supabase
      .from('alumnos')
      .select('id, nombre, apellido')
      .eq('id', alumnoId)
      .eq('padre_id', user.id)
      .single()

    if (alumnoErr || !alumno) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    }

    // Verificar que el alumno NO tiene suscripción activa
    const suscripcionExistente = await getSuscripcionByAlumno(supabase, alumnoId)
    if (suscripcionExistente) {
      return NextResponse.json(
        { error: 'El alumno ya tiene una suscripción activa' },
        { status: 409 }
      )
    }

    // Precio del plan
    console.log('SEMILLAS_PRICES:', SEMILLAS_PRICES)
    console.log('paquete recibido:', paquete)
    const priceId = SEMILLAS_PRICES[paquete as SemillasPaquete]
    if (!priceId) {
      return NextResponse.json({ error: 'Paquete inválido o no configurado' }, { status: 400 })
    }

    // Buscar o crear Stripe Customer para el padre
    let customerId: string
    const existingCustomers = await stripe.customers.search({
      query: `metadata['padre_id']:'${user.id}'`,
    })

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email: perfil.email ?? user.email ?? undefined,
        name:
          perfil.nombre && perfil.apellido
            ? `${perfil.nombre} ${perfil.apellido}`
            : perfil.nombre ?? undefined,
        metadata: { padre_id: user.id },
      })
      customerId = customer.id
    }

    // Crear Stripe Subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        alumno_id: alumnoId,
        padre_id: user.id,
        paquete,
      },
    })

    // latest_invoice se expande via `expand: ['latest_invoice.payment_intent']`
    // Accedemos via cast porque TS no infiere el tipo expandido automáticamente
    const latestInvoice = subscription.latest_invoice as import('stripe').Stripe.Invoice & {
      payment_intent: import('stripe').Stripe.PaymentIntent | null
    }
    const paymentIntent = latestInvoice?.payment_intent as import('stripe').Stripe.PaymentIntent | null

    if (!paymentIntent?.client_secret) {
      return NextResponse.json({ error: 'No se pudo crear el intento de pago' }, { status: 500 })
    }

    // Obtener precio de la suscripción
    const price = await stripe.prices.retrieve(priceId)
    const precioMensual = price.unit_amount ?? 0

    // Guardar en DB con SUPABASE_SERVICE_ROLE_KEY
    const adminSupabase = createAdminClient()
    const { error: insertErr } = await adminSupabase.from('semillas_suscripciones').insert({
      alumno_id: alumnoId,
      padre_id: user.id,
      paquete,
      status: 'activa',
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      precio_mensual: precioMensual,
      fecha_inicio: new Date().toISOString(),
    })

    if (insertErr) {
      console.error('[semillas/subscribe] Error guardando suscripción:', insertErr)
      // Cancelar suscripción en Stripe para no dejar huérfana
      await stripe.subscriptions.cancel(subscription.id)
      return NextResponse.json({ error: 'Error al guardar la suscripción' }, { status: 500 })
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('[semillas] Error completo:', error)
    console.error('[semillas] Error message:', error instanceof Error ? error.message : String(error))
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
