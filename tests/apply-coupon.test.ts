import { describe, it, expect } from 'vitest'
import { applyCoupon } from '@/server/payments/apply-coupon'

const cuponBase = {
  tipo: 'porcentaje' as const,
  valor: 20,
  aplica_a: 'todos' as const,
  activo: true,
  fecha_expiracion: null,
  usos_actuales: 0,
  usos_maximos: 10,
}

const contextoBase = {
  tipo_pago: 'colegiatura' as const,
  monto: 500000, // $5,000 en centavos
  fecha: new Date('2025-06-01'),
}

describe('applyCoupon', () => {
  it('cupón inactivo → valido: false, error: Cupón inactivo', () => {
    const result = applyCoupon({ ...cuponBase, activo: false }, contextoBase)
    expect(result.valido).toBe(false)
    expect(result.error).toBe('Cupón inactivo')
  })

  it('cupón expirado → valido: false, error: Cupón expirado', () => {
    const result = applyCoupon(
      { ...cuponBase, fecha_expiracion: new Date('2024-01-01') },
      contextoBase
    )
    expect(result.valido).toBe(false)
    expect(result.error).toBe('Cupón expirado')
  })

  it('cupón sin usos disponibles → valido: false', () => {
    const result = applyCoupon(
      { ...cuponBase, usos_actuales: 10, usos_maximos: 10 },
      contextoBase
    )
    expect(result.valido).toBe(false)
  })

  it("cupón aplica_a='inscripcion' en colegiatura → valido: false", () => {
    const result = applyCoupon(
      { ...cuponBase, aplica_a: 'inscripcion' },
      { ...contextoBase, tipo_pago: 'colegiatura' }
    )
    expect(result.valido).toBe(false)
  })

  it('cupón porcentaje 20% en $5,000 → descuento: 100000 centavos', () => {
    const result = applyCoupon(
      { ...cuponBase, tipo: 'porcentaje', valor: 20 },
      { ...contextoBase, monto: 500000 }
    )
    expect(result.valido).toBe(true)
    expect(result.descuento).toBe(100000)
  })

  it('cupón monto_fijo $500 → descuento: 50000 centavos', () => {
    const result = applyCoupon(
      { ...cuponBase, tipo: 'monto_fijo', valor: 50000 },
      contextoBase
    )
    expect(result.valido).toBe(true)
    expect(result.descuento).toBe(50000)
  })

  it('cupón condonacion_inscripcion → descuento === monto completo', () => {
    const result = applyCoupon(
      { ...cuponBase, tipo: 'condonacion_inscripcion', valor: 0, aplica_a: 'inscripcion' },
      { ...contextoBase, tipo_pago: 'inscripcion', monto: 400000 }
    )
    expect(result.valido).toBe(true)
    expect(result.descuento).toBe(400000)
  })

  it('descuento no puede superar el monto', () => {
    const result = applyCoupon(
      { ...cuponBase, tipo: 'monto_fijo', valor: 9999999 },
      { ...contextoBase, monto: 500000 }
    )
    expect(result.valido).toBe(true)
    expect(result.descuento).toBeLessThanOrEqual(500000)
  })

  it('usos_maximos null = ilimitado → valido: true', () => {
    const result = applyCoupon(
      { ...cuponBase, usos_actuales: 9999, usos_maximos: null },
      contextoBase
    )
    expect(result.valido).toBe(true)
  })

  // Edge cases
  it('fecha_expiracion exactamente hoy → válido', () => {
    // Expira el mismo día de uso → sigue siendo válido (no ha expirado aún)
    const hoy = new Date('2025-06-01')
    const result = applyCoupon(
      { ...cuponBase, fecha_expiracion: hoy },
      { ...contextoBase, fecha: hoy }
    )
    expect(result.valido).toBe(true)
  })

  it('usos_actuales === usos_maximos → inválido', () => {
    const result = applyCoupon(
      { ...cuponBase, usos_actuales: 5, usos_maximos: 5 },
      contextoBase
    )
    expect(result.valido).toBe(false)
  })

  it("cupón aplica_a='colegiatura' en semillas_sabiduria → inválido", () => {
    const result = applyCoupon(
      { ...cuponBase, aplica_a: 'colegiatura' },
      { ...contextoBase, tipo_pago: 'semillas_sabiduria' }
    )
    expect(result.valido).toBe(false)
  })

  it('valor porcentaje > 100 → descuento máximo es el monto completo', () => {
    const result = applyCoupon(
      { ...cuponBase, tipo: 'porcentaje', valor: 150 },
      { ...contextoBase, monto: 500000 }
    )
    expect(result.valido).toBe(true)
    expect(result.descuento).toBe(500000)
  })
})
