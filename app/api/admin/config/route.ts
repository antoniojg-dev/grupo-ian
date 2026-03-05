import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { updateConfiguracion } from '@/services/configuracion'

const schema = z.object({
  clave: z.string().min(1),
  valor: z.string().min(1),
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

    await updateConfiguracion(supabase, parsed.data.clave, parsed.data.valor, user.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/config]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
