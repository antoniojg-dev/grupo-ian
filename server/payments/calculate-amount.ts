export interface CalculateAmountParams {
  precioBase: number      // centavos
  becaPorcentaje: number  // 0-100
  descuentoCupon: number  // centavos
}

export interface CalculateAmountResult {
  montoOriginal: number
  descuentoBeca: number
  descuentoCupon: number
  montoFinal: number
}

export function calculateAmount(params: CalculateAmountParams): CalculateAmountResult {
  const { precioBase, becaPorcentaje, descuentoCupon } = params

  const montoOriginal = precioBase
  const descuentoBeca = Math.floor(precioBase * becaPorcentaje / 100)

  // El descuento de cupón no puede superar lo que queda tras la beca
  const maxCupon = Math.max(0, precioBase - descuentoBeca)
  const descuentoCuponAplicado = Math.min(descuentoCupon, maxCupon)

  const montoFinal = Math.max(0, precioBase - descuentoBeca - descuentoCuponAplicado)

  return {
    montoOriginal,
    descuentoBeca,
    descuentoCupon: descuentoCuponAplicado,
    montoFinal,
  }
}
