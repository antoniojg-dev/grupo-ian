import { SupabaseClient } from '@supabase/supabase-js'
import { Perfil } from '@/types'

export async function getPerfilById(supabase: SupabaseClient, id: string): Promise<Perfil | null> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre, apellido, rol')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Perfil
}
