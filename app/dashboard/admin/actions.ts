'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAlumno, updateAlumno, toggleAlumnoActivo } from '@/services/alumnos'
import { getConfiguracion } from '@/services/configuracion'
import { redirect } from 'next/navigation'

export async function createAlumnoAction(data: {
  nombre: string
  apellido: string
  grado?: string
  grupo?: string
  beca_porcentaje?: number
  tipo?: 'interno' | 'externo'
  cobrarInscripcion?: boolean
  descuentoInscripcion?: number
}) {
  const supabase = await createClient()
  const alumno = await createAlumno(supabase, {
    nombre: data.nombre,
    apellido: data.apellido,
    grado: data.grado,
    grupo: data.grupo,
    beca_porcentaje: data.beca_porcentaje,
    tipo: data.tipo,
  })

  if (data.cobrarInscripcion && data.tipo === 'interno') {
    const adminClient = createAdminClient()
    const config = await getConfiguracion(adminClient)
    const descuento = Math.min(100, Math.max(0, data.descuentoInscripcion ?? 0))
    const precioBase = config.precioInscripcion
    const montoFinal = Math.round(precioBase * (1 - descuento / 100))

    const ahora = new Date()
    const periodoMes = ahora.getMonth() + 1
    const periodoAnio = ahora.getFullYear()

    const { data: servicio } = await adminClient
      .from('servicios')
      .select('id')
      .eq('tipo', 'inscripcion')
      .single()

    if (servicio) {
      await adminClient.from('pagos').insert({
        alumno_id: alumno.id,
        servicio_id: servicio.id,
        padre_id: null,
        monto_original: precioBase,
        descuento_beca: 0,
        descuento_cupon: 0,
        monto_final: montoFinal,
        periodo_mes: periodoMes,
        periodo_anio: periodoAnio,
        estado: 'pendiente',
        metodo_pago: null,
      })
    }
  }

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

const UpdateAlumnoFullSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  tipo: z.enum(['interno', 'externo']),
  grado: z.string().optional(),
  grupo: z.string().optional(),
  beca_porcentaje: z.number().min(0).max(100),
  activo: z.boolean(),
})

export async function updateAlumnoFullAction(
  id: string,
  data: z.infer<typeof UpdateAlumnoFullSchema>
) {
  const parsed = UpdateAlumnoFullSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('alumnos')
    .update({
      nombre: parsed.data.nombre,
      apellido: parsed.data.apellido,
      tipo: parsed.data.tipo,
      grado: parsed.data.tipo === 'interno' ? (parsed.data.grado ?? '') : '',
      grupo: parsed.data.tipo === 'interno' ? (parsed.data.grupo ?? null) : null,
      beca_porcentaje: parsed.data.tipo === 'interno' ? parsed.data.beca_porcentaje : 0,
      activo: parsed.data.activo,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  redirect(`/dashboard/admin/alumnos/${id}`)
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
