import { SupabaseClient } from '@supabase/supabase-js'
import { Alumno } from '@/types'

export async function getAlumnos(supabase: SupabaseClient): Promise<Alumno[]> {
  const { data: alumnos, error } = await supabase
    .from('alumnos')
    .select('*')
    .order('apellido', { ascending: true })

  if (error) throw error
  if (!alumnos || alumnos.length === 0) return []

  const padreIds = [...new Set(alumnos.filter((a) => a.padre_id).map((a) => a.padre_id as string))]

  if (padreIds.length === 0) return alumnos

  const { data: perfiles } = await supabase
    .from('perfiles')
    .select('id, nombre, apellido')
    .in('id', padreIds)

  const perfilMap = new Map((perfiles ?? []).map((p) => [p.id, p]))

  return alumnos.map((a) => ({
    ...a,
    padre: a.padre_id ? (perfilMap.get(a.padre_id) ?? null) : null,
  }))
}

export async function getAlumnoById(supabase: SupabaseClient, id: string) {
  const { data: alumno, error } = await supabase
    .from('alumnos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error

  const [{ data: pagos }, perfilResult] = await Promise.all([
    supabase
      .from('pagos')
      .select('*, servicios(nombre)')
      .eq('alumno_id', id)
      .order('created_at', { ascending: false }),
    alumno.padre_id
      ? supabase.from('perfiles').select('nombre, apellido').eq('id', alumno.padre_id).single()
      : Promise.resolve({ data: null }),
  ])

  return {
    ...alumno,
    pagos: pagos ?? [],
    padre: (perfilResult as { data: unknown }).data ?? null,
  }
}

export async function createAlumno(
  supabase: SupabaseClient,
  data: {
    nombre: string
    apellido: string
    grado: string
    grupo?: string
    beca_porcentaje?: number
  }
) {
  const { data: alumno, error } = await supabase
    .from('alumnos')
    .insert({
      nombre: data.nombre,
      apellido: data.apellido,
      grado: data.grado,
      grupo: data.grupo ?? null,
      beca_porcentaje: data.beca_porcentaje ?? 0,
      activo: true,
    })
    .select()
    .single()

  if (error) throw error
  return alumno
}

export async function updateAlumno(
  supabase: SupabaseClient,
  id: string,
  data: Partial<Pick<Alumno, 'nombre' | 'apellido' | 'grado' | 'grupo' | 'beca_porcentaje'>>
) {
  const { error } = await supabase.from('alumnos').update(data).eq('id', id)
  if (error) throw error
}

export async function toggleAlumnoActivo(supabase: SupabaseClient, id: string, activo: boolean) {
  const { error } = await supabase.from('alumnos').update({ activo }).eq('id', id)
  if (error) throw error
}

export async function updateAlumnoPadre(supabase: SupabaseClient, alumnoId: string, padreId: string) {
  const { error } = await supabase
    .from('alumnos')
    .update({ padre_id: padreId })
    .eq('id', alumnoId)
  if (error) throw error
}

export async function getAlumnosByPadre(supabase: SupabaseClient, padreId: string) {
  const now = new Date()
  const mes = now.getMonth() + 1
  const anio = now.getFullYear()

  const { data: alumnos, error } = await supabase
    .from('alumnos')
    .select('*')
    .eq('padre_id', padreId)
    .eq('activo', true)
    .order('apellido', { ascending: true })

  if (error) throw error
  if (!alumnos || alumnos.length === 0) return []

  const alumnoIds = alumnos.map((a) => a.id)

  const { data: pagos } = await supabase
    .from('pagos')
    .select('alumno_id, estado')
    .in('alumno_id', alumnoIds)
    .eq('periodo_mes', mes)
    .eq('periodo_anio', anio)

  const pagoMap = new Map((pagos ?? []).map((p) => [p.alumno_id, p.estado]))

  return alumnos.map((a) => ({
    ...a,
    estado_pago_mes: (pagoMap.get(a.id) ?? 'pendiente') as 'pagado' | 'pendiente' | 'vencido' | 'condonado',
  }))
}
