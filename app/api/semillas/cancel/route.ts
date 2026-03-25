import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

const schema = z.object({
  suscripcionId: z.string().uuid(),
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
      .select('rol')
      .eq('id', user.id)
      .single()

    if (!perfil || perfil.rol !== 'padre') {
      return NextResponse.json({ error: 'Solo padres pueden cancelar' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.issues },
        { status: 400 }
      )
    }
    const { suscripcionId } = parsed.data

    // Verificar que la suscripción pertenece al padre
    const { data: suscripcion, error: suscripcionErr } = await supabase
      .from('semillas_suscripciones')
      .select('id, stripe_subscription_id, padre_id')
      .eq('id', suscripcionId)
      .eq('padre_id', user.id)
      .single()

    if (suscripcionErr || !suscripcion) {
      return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 })
    }

    // Cancelar en Stripe
    await stripe.subscriptions.cancel(suscripcion.stripe_subscription_id)

    // Actualizar en DB
    const adminSupabase = createAdminClient()
    await adminSupabase
      .from('semillas_suscripciones')
      .update({
        status: 'cancelada',
        fecha_cancelacion: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', suscripcionId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[semillas/cancel]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
