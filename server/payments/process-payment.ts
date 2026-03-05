import { calculateAmount } from './calculate-amount'
import { applyCoupon, Cupon, ContextoPago } from './apply-coupon'
import { isMonthFrozen, Congelacion } from './freeze-month'
import { Alumno, Servicio } from '@/types'

export interface BuildPaymentDataParams {
  alumno: Alumno
  servicio: Servicio
  cupon?: Cupon
  mes?: number
  anio?: number
  congelaciones: Congelacion[]
}

export interface BuildPaymentDataResult {
  valido: boolean
  error?: string
  montoOriginal: number
  descuentoBeca: number
  descuentoCupon: number
  montoFinal: number
  esMesCongelado: boolean
}

function toTipoPago(tipo: Servicio['tipo']): ContextoPago['tipo_pago'] {
  if (tipo === 'inscripcion') return 'inscripcion'
  if (tipo === 'semillas_sabiduria') return 'semillas_sabiduria'
  return 'colegiatura'
}

export function buildPaymentData(params: BuildPaymentDataParams): BuildPaymentDataResult {
  const { alumno, servicio, cupon, mes, anio, congelaciones } = params

  const empty: BuildPaymentDataResult = {
    valido: false,
    montoOriginal: 0,
    descuentoBeca: 0,
    descuentoCupon: 0,
    montoFinal: 0,
    esMesCongelado: false,
  }

  // Verificar mes congelado (solo aplica cuando se proveen mes y anio)
  const esMesCongelado =
    mes != null && anio != null ? isMonthFrozen(congelaciones, mes, anio) : false

  if (esMesCongelado) {
    return { ...empty, esMesCongelado: true, error: 'Este mes está congelado para este alumno' }
  }

  // Aplicar cupón si se proporciona
  let descuentoCupon = 0
  if (cupon) {
    const couponResult = applyCoupon(cupon, {
      tipo_pago: toTipoPago(servicio.tipo),
      monto: servicio.precio_base,
      fecha: new Date(),
    })
    if (!couponResult.valido) {
      return { ...empty, error: couponResult.error }
    }
    descuentoCupon = couponResult.descuento
  }

  // Calcular monto final
  const result = calculateAmount({
    precioBase: servicio.precio_base,
    becaPorcentaje: alumno.beca_porcentaje,
    descuentoCupon,
  })

  return {
    valido: true,
    montoOriginal: result.montoOriginal,
    descuentoBeca: result.descuentoBeca,
    descuentoCupon: result.descuentoCupon,
    montoFinal: result.montoFinal,
    esMesCongelado: false,
  }
}
