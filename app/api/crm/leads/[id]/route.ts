import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const schema = z.object({
  status: z.enum(['nuevo', 'contactado', 'en_proceso', 'inscrito', 'cancelado']).optional(),
  notas: z.string().optional(),
  razon_cancelacion: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    }
    if (parsed.data.status !== undefined) updates.status = parsed.data.status
    if (parsed.data.notas !== undefined) updates.notas = parsed.data.notas
    if (parsed.data.razon_cancelacion !== undefined) {
      updates.razon_cancelacion = parsed.data.razon_cancelacion
    }

    const admin = createAdminClient()
    const { error } = await admin.from('crm_leads').update(updates).eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
