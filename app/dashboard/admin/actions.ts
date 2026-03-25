'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAlumno, updateAlumno, toggleAlumnoActivo } from '@/services/alumnos'
import { redirect } from 'next/navigation'

export async function createAlumnoAction(data: {
  nombre: string
  apellido: string
  grado?: string
  grupo?: string
  beca_porcentaje?: number
  tipo?: 'interno' | 'externo'
}) {
  const supabase = await createClient()
  const alumno = await createAlumno(supabase, data)
  return alumno
}

export async function invitarPadreAction(
  email: string,
  nombre: string,
  apellido: string,
  alumnoId: string
) {
  const adminClient = createAdminClient()

  // 1. Invitar al padre por email (crea usuario en auth.users)
  //    Se incluye alumno_id en metadata para vincular padre_id cuando acepte la invitación
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { nombre, apellido, alumno_id: alumnoId },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
  })

  if (error) throw new Error(`Error al invitar padre: ${error.message}`)

  const padreId = data.user.id

  // 2. Crear/actualizar perfil del padre
  await adminClient.from('perfiles').upsert({
    id: padreId,
    nombre,
    apellido,
    rol: 'padre',
  })

  // padre_id en alumnos se actualiza cuando el padre acepta la invitación (/auth/confirm)

  return { padreId }
}

export async function updateAlumnoAction(
  id: string,
  data: {
    nombre?: string
    apellido?: string
    grado?: string
    grupo?: string
    beca_porcentaje?: number
  }
) {
  const supabase = await createClient()
  await updateAlumno(supabase, id, data)
}

export async function toggleAlumnoActivoAction(id: string, activo: boolean) {
  const supabase = await createClient()
  await toggleAlumnoActivo(supabase, id, activo)
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
