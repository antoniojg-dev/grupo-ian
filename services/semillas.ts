import { SupabaseClient } from '@supabase/supabase-js'
import { SemillasSuscripcion } from '@/types'

export async function getSuscripcionByAlumno(
  supabase: SupabaseClient,
  alumnoId: string
): Promise<SemillasSuscripcion | null> {
  const { data, error } = await supabase
    .from('semillas_suscripciones')
    .select('*')
    .eq('alumno_id', alumnoId)
    .eq('status', 'activa')
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

export async function getSuscripcionesByPadre(
  supabase: SupabaseClient,
  padreId: string
): Promise<SemillasSuscripcion[]> {
  const { data, error } = await supabase
    .from('semillas_suscripciones')
    .select('*')
    .eq('padre_id', padreId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getSuscripcionesAdmin(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('semillas_suscripciones')
    .select(`
      *,
      alumnos(nombre, apellido, grado),
      perfiles:padre_id(nombre, apellido)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
