import { describe, it, expect } from 'vitest'
import { calculateAmount } from '@/server/payments/calculate-amount'

describe('calculateAmount', () => {
  it('sin beca ni cupón → montoFinal === precioBase', () => {
    const result = calculateAmount({ precioBase: 500000, becaPorcentaje: 0, descuentoCupon: 0 })
    expect(result.montoFinal).toBe(500000)
    expect(result.montoOriginal).toBe(500000)
    expect(result.descuentoBeca).toBe(0)
    expect(result.descuentoCupon).toBe(0)
  })

  it('beca 50% → descuentoBeca = precioBase * 0.5', () => {
    const result = calculateAmount({ precioBase: 500000, becaPorcentaje: 50, descuentoCupon: 0 })
    expect(result.descuentoBeca).toBe(250000)
    expect(result.montoFinal).toBe(250000)
  })

  it('beca 100% → montoFinal === 0', () => {
    const result = calculateAmount({ precioBase: 500000, becaPorcentaje: 100, descuentoCupon: 0 })
    expect(result.montoFinal).toBe(0)
  })

  it('cupón $500 → descuentoCupon = 50000 centavos', () => {
    const result = calculateAmount({ precioBase: 500000, becaPorcentaje: 0, descuentoCupon: 50000 })
    expect(result.descuentoCupon).toBe(50000)
    expect(result.montoFinal).toBe(450000)
  })

  it('beca 25% + cupón $200 → calcula correctamente', () => {
    // precioBase = 500000 ($5000), beca 25% = 125000, descuentoCupon = 20000 ($200)
    const result = calculateAmount({ precioBase: 500000, becaPorcentaje: 25, descuentoCupon: 20000 })
    expect(result.descuentoBeca).toBe(125000)
    expect(result.descuentoCupon).toBe(20000)
    expect(result.montoFinal).toBe(355000)
  })

  it('descuentos no pueden superar el precio base', () => {
    // beca 80% + cupón enorme
    const result = calculateAmount({ precioBase: 500000, becaPorcentaje: 80, descuentoCupon: 200000 })
    expect(result.descuentoBeca + result.descuentoCupon).toBeLessThanOrEqual(500000)
  })

  it('montoFinal nunca es negativo', () => {
    const result = calculateAmount({ precioBase: 100000, becaPorcentaje: 50, descuentoCupon: 999999 })
    expect(result.montoFinal).toBeGreaterThanOrEqual(0)
  })

  it('todos los valores son enteros (sin decimales)', () => {
    const result = calculateAmount({ precioBase: 333333, becaPorcentaje: 33, descuentoCupon: 10000 })
    expect(Number.isInteger(result.montoOriginal)).toBe(true)
    expect(Number.isInteger(result.descuentoBeca)).toBe(true)
    expect(Number.isInteger(result.descuentoCupon)).toBe(true)
    expect(Number.isInteger(result.montoFinal)).toBe(true)
  })

  // Edge cases
  it('precio base 0 → montoFinal === 0', () => {
    const result = calculateAmount({ precioBase: 0, becaPorcentaje: 50, descuentoCupon: 10000 })
    expect(result.montoFinal).toBe(0)
    expect(result.descuentoBeca).toBe(0)
    expect(result.descuentoCupon).toBe(0)
  })

  it('beca con decimales (33.33%) → resultado es entero', () => {
    const result = calculateAmount({ precioBase: 500000, becaPorcentaje: 33.33, descuentoCupon: 0 })
    expect(Number.isInteger(result.descuentoBeca)).toBe(true)
    expect(Number.isInteger(result.montoFinal)).toBe(true)
  })

  it('cupón mayor al precio base → montoFinal === 0, no negativo', () => {
    const result = calculateAmount({ precioBase: 500000, becaPorcentaje: 0, descuentoCupon: 999999 })
    expect(result.montoFinal).toBe(0)
    expect(result.descuentoCupon).toBe(500000)
  })

  it('beca + cupón juntos superan el precio → montoFinal === 0', () => {
    // beca 60% = 300000, cupón 300000, suma 600000 > 500000
    const result = calculateAmount({ precioBase: 500000, becaPorcentaje: 60, descuentoCupon: 300000 })
    expect(result.montoFinal).toBe(0)
  })
})
