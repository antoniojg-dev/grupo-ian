import { SupabaseClient } from '@supabase/supabase-js'

export type Configuracion = {
  precioInscripcion: number     // centavos
  precioColegiatura: number     // centavos
  precioSemillasSiembra: number // centavos
  precioSemillasCrece: number   // centavos
  precioSemillasFlorece: number // centavos
  diaCorte: number
  diaGeneracion: number
  anioEscolar: number
}

const DEFAULTS: Configuracion = {
  precioInscripcion: 400000,
  precioColegiatura: 500000,
  precioSemillasSiembra: 125000,
  precioSemillasCrece: 180000,
  precioSemillasFlorece: 250000,
  diaCorte: 10,
  diaGeneracion: 1,
  anioEscolar: 2025,
}

const KEY_MAP: Record<string, keyof Configuracion> = {
  precio_inscripcion: 'precioInscripcion',
  precio_colegiatura: 'precioColegiatura',
  precio_semillas_siembra: 'precioSemillasSiembra',
  precio_semillas_crece: 'precioSemillasCrece',
  precio_semillas_florece: 'precioSemillasFlorece',
  dia_corte: 'diaCorte',
  dia_generacion: 'diaGeneracion',
  anio_escolar: 'anioEscolar',
}

// Price keys that should also sync to servicios.precio_base
const PRECIO_TO_SERVICIO: Record<string, { tipo: string; nombre?: string }> = {
  precio_inscripcion: { tipo: 'inscripcion' },
  precio_colegiatura: { tipo: 'colegiatura' },
  precio_semillas_siembra: { tipo: 'semillas_sabiduria', nombre: 'Siembra' },
  precio_semillas_crece: { tipo: 'semillas_sabiduria', nombre: 'Crece' },
  precio_semillas_florece: { tipo: 'semillas_sabiduria', nombre: 'Florece' },
}

export async function getConfiguracion(supabase: SupabaseClient): Promise<Configuracion> {
  const { data, error } = await supabase.from('configuracion').select('clave, valor')

  if (error) {
    console.error('[getConfiguracion]', error)
    return { ...DEFAULTS }
  }

  const result: Configuracion = { ...DEFAULTS }
  for (const row of data ?? []) {
    const field = KEY_MAP[row.clave]
    if (field !== undefined) {
      result[field] = Number(row.valor)
    }
  }
  return result
}

export async function updateConfiguracion(
  supabase: SupabaseClient,
  clave: string,
  valor: string,
  adminId: string
) {
  const { error } = await supabase.from('configuracion').upsert(
    { clave, valor, updated_at: new Date().toISOString(), updated_by: adminId },
    { onConflict: 'clave' }
  )
  if (error) throw error

  // Sync price change to servicios.precio_base to keep checkout consistent
  const servicioInfo = PRECIO_TO_SERVICIO[clave]
  if (servicioInfo) {
    if (servicioInfo.nombre) {
      await supabase
        .from('servicios')
        .update({ precio_base: Number(valor) })
        .eq('tipo', servicioInfo.tipo)
        .ilike('nombre', `%${servicioInfo.nombre}%`)
    } else {
      await supabase
        .from('servicios')
        .update({ precio_base: Number(valor) })
        .eq('tipo', servicioInfo.tipo)
    }
  }
}
