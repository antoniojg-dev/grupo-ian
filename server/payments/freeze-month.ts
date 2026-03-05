export interface Congelacion {
  alumno_id: string
  mes: number
  anio: number
}

export function isMonthFrozen(congelaciones: Congelacion[], mes: number, anio: number): boolean {
  return congelaciones.some((c) => c.mes === mes && c.anio === anio)
}
