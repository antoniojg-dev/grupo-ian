export interface Cupon {
  tipo: 'porcentaje' | 'monto_fijo' | 'condonacion_inscripcion'
  valor: number
  aplica_a: 'inscripcion' | 'colegiatura' | 'todos'
  activo: boolean
  fecha_expiracion: Date | null
  usos_actuales: number
  usos_maximos: number | null
}

export interface ContextoPago {
  tipo_pago: 'inscripcion' | 'colegiatura' | 'semillas_sabiduria'
  monto: number  // centavos
  fecha: Date
}

export interface ApplyCouponResult {
  valido: boolean
  descuento: number
  error?: string
}

export function applyCoupon(cupon: Cupon, contexto: ContextoPago): ApplyCouponResult {
  if (!cupon.activo) {
    return { valido: false, descuento: 0, error: 'Cupón inactivo' }
  }

  if (cupon.fecha_expiracion !== null && contexto.fecha > cupon.fecha_expiracion) {
    return { valido: false, descuento: 0, error: 'Cupón expirado' }
  }

  if (cupon.usos_maximos !== null && cupon.usos_actuales >= cupon.usos_maximos) {
    return { valido: false, descuento: 0, error: 'Cupón sin usos disponibles' }
  }

  if (cupon.aplica_a !== 'todos' && cupon.aplica_a !== contexto.tipo_pago) {
    return { valido: false, descuento: 0, error: 'Cupón no aplica a este tipo de pago' }
  }

  let descuento = 0

  if (cupon.tipo === 'porcentaje') {
    descuento = Math.floor(contexto.monto * cupon.valor / 100)
  } else if (cupon.tipo === 'monto_fijo') {
    descuento = cupon.valor
  } else if (cupon.tipo === 'condonacion_inscripcion') {
    descuento = contexto.monto
  }

  // El descuento no puede superar el monto
  descuento = Math.min(descuento, contexto.monto)

  return { valido: true, descuento }
}
