export interface Pago {
  estado: string
  periodo_mes: number
  periodo_anio: number
  created_at: string
}

export function isOverdue(pago: Pago, fechaActual: Date): boolean {
  if (pago.estado !== 'pendiente') return false

  const anioActual = fechaActual.getFullYear()
  const mesActual = fechaActual.getMonth() + 1 // 1-12

  if (pago.periodo_anio < anioActual) return true
  if (pago.periodo_anio === anioActual && pago.periodo_mes < mesActual) return true

  return false
}
