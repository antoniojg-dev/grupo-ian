import { SupabaseClient } from '@supabase/supabase-js'
import { KPIs, Pago } from '@/types'

export type PagoFilters = {
  mes?: number
  anio?: number
  estado?: string
  alumno_id?: string
}

export async function getPagos(supabase: SupabaseClient, filters?: PagoFilters): Promise<Pago[]> {
  let query = supabase
    .from('pagos')
    .select('*, alumnos(nombre, apellido, grado), servicios(nombre)')
    .order('created_at', { ascending: false })

  if (filters?.mes) query = query.eq('periodo_mes', filters.mes)
  if (filters?.anio) query = query.eq('periodo_anio', filters.anio)
  if (filters?.estado) query = query.eq('estado', filters.estado)
  if (filters?.alumno_id) query = query.eq('alumno_id', filters.alumno_id)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Pago[]
}

export async function getPagosByAlumno(supabase: SupabaseClient, alumnoId: string): Promise<Pago[]> {
  const { data, error } = await supabase
    .from('pagos')
    .select('*, servicios(nombre)')
    .eq('alumno_id', alumnoId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Pago[]
}

export async function getUltimosPagos(supabase: SupabaseClient, limit = 5): Promise<Pago[]> {
  const { data, error } = await supabase
    .from('pagos')
    .select('*, alumnos(nombre, apellido, grado), servicios(nombre)')
    .eq('estado', 'pagado')
    .order('paid_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as Pago[]
}

export async function getAlumnosConAdeudo(supabase: SupabaseClient) {
  const now = new Date()
  const mes = now.getMonth() + 1
  const anio = now.getFullYear()

  // Alumnos activos
  const { data: activos } = await supabase
    .from('alumnos')
    .select('id, nombre, apellido, grado')
    .eq('activo', true)

  if (!activos || activos.length === 0) return []

  // Alumnos que pagaron este mes
  const { data: pagados } = await supabase
    .from('pagos')
    .select('alumno_id')
    .eq('estado', 'pagado')
    .eq('periodo_mes', mes)
    .eq('periodo_anio', anio)

  const pagadosIds = new Set((pagados ?? []).map((p) => p.alumno_id))

  return activos.filter((a) => !pagadosIds.has(a.id))
}

export async function getPagosByPadre(supabase: SupabaseClient, padreId: string): Promise<Pago[]> {
  const { data, error } = await supabase
    .from('pagos')
    .select('*, alumnos(nombre, apellido, grado), servicios(nombre)')
    .eq('padre_id', padreId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Pago[]
}

export async function getEstadoPagoMes(
  supabase: SupabaseClient,
  alumnoId: string,
  mes: number,
  anio: number
): Promise<string | null> {
  const { data } = await supabase
    .from('pagos')
    .select('estado')
    .eq('alumno_id', alumnoId)
    .eq('periodo_mes', mes)
    .eq('periodo_anio', anio)
    .single()

  return data?.estado ?? null
}

export async function getKPIs(supabase: SupabaseClient): Promise<KPIs> {
  const now = new Date()
  const mes = now.getMonth() + 1
  const anio = now.getFullYear()

  const [pagosMesResult, totalAlumnosResult, alumnosPagadosResult, inscripcionesResult] =
    await Promise.allSettled([
      supabase
        .from('pagos')
        .select('monto_final')
        .eq('estado', 'pagado')
        .eq('periodo_mes', mes)
        .eq('periodo_anio', anio),
      supabase.from('alumnos').select('id', { count: 'exact', head: true }).eq('activo', true),
      supabase
        .from('pagos')
        .select('alumno_id')
        .eq('estado', 'pagado')
        .eq('periodo_mes', mes)
        .eq('periodo_anio', anio),
      supabase
        .from('inscripciones')
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'pendiente')
        .gte('created_at', `${anio}-01-01`)
        .lt('created_at', `${anio + 1}-01-01`),
    ])

  const pagosMes =
    pagosMesResult.status === 'fulfilled' ? (pagosMesResult.value.data ?? []) : []
  const total_cobrado = pagosMes.reduce((sum, p) => sum + (p.monto_final ?? 0), 0)

  const total_alumnos_activos =
    totalAlumnosResult.status === 'fulfilled' ? (totalAlumnosResult.value.count ?? 0) : 0

  const alumnosPagados =
    alumnosPagadosResult.status === 'fulfilled' ? (alumnosPagadosResult.value.data ?? []) : []
  const alumnos_al_corriente = new Set(alumnosPagados.map((p) => p.alumno_id)).size

  const inscripciones_pendientes =
    inscripcionesResult.status === 'fulfilled' ? (inscripcionesResult.value.count ?? 0) : 0

  return {
    total_cobrado,
    alumnos_al_corriente,
    alumnos_con_adeudo: Math.max(0, total_alumnos_activos - alumnos_al_corriente),
    inscripciones_pendientes,
    total_alumnos_activos,
  }
}
