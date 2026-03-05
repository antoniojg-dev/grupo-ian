import { SupabaseClient } from '@supabase/supabase-js'
import { Servicio } from '@/types'

export async function getServicios(supabase: SupabaseClient): Promise<Servicio[]> {
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('activo', true)
    .order('nombre', { ascending: true })

  if (error) throw error
  return (data ?? []) as Servicio[]
}
