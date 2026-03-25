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

    if (!perfil || perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo admins pueden usar esta ruta' }, { status: 403 })
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

    const adminSupabase = createAdminClient()

    // Buscar la suscripción (sin restricción de padre_id)
    const { data: suscripcion, error: suscripcionErr } = await adminSupabase
      .from('semillas_suscripciones')
      .select('id, stripe_subscription_id')
      .eq('id', suscripcionId)
      .single()

    if (suscripcionErr || !suscripcion) {
      return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 })
    }

    // Cancelar en Stripe
    await stripe.subscriptions.cancel(suscripcion.stripe_subscription_id)

    // Actualizar en DB
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
    console.error('[semillas/admin/cancel]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
