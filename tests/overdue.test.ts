import { describe, it, expect } from 'vitest'
import { isOverdue } from '@/server/payments/overdue'

// fechaActual: marzo 2025
const fechaActual = new Date('2025-03-15')

describe('isOverdue', () => {
  it('pago pagado → false (nunca vencido)', () => {
    const pago = {
      estado: 'pagado',
      periodo_mes: 1,
      periodo_anio: 2025,
      created_at: '2025-01-01T00:00:00Z',
    }
    expect(isOverdue(pago, fechaActual)).toBe(false)
  })

  it('pago condonado → false', () => {
    const pago = {
      estado: 'condonado',
      periodo_mes: 1,
      periodo_anio: 2025,
      created_at: '2025-01-01T00:00:00Z',
    }
    expect(isOverdue(pago, fechaActual)).toBe(false)
  })

  it('pago pendiente del mes actual → false', () => {
    const pago = {
      estado: 'pendiente',
      periodo_mes: 3,
      periodo_anio: 2025,
      created_at: '2025-03-01T00:00:00Z',
    }
    expect(isOverdue(pago, fechaActual)).toBe(false)
  })

  it('pago pendiente del mes anterior → true', () => {
    const pago = {
      estado: 'pendiente',
      periodo_mes: 2,
      periodo_anio: 2025,
      created_at: '2025-02-01T00:00:00Z',
    }
    expect(isOverdue(pago, fechaActual)).toBe(true)
  })

  it('pago pendiente de hace 3 meses → true', () => {
    const pago = {
      estado: 'pendiente',
      periodo_mes: 12,
      periodo_anio: 2024,
      created_at: '2024-12-01T00:00:00Z',
    }
    expect(isOverdue(pago, fechaActual)).toBe(true)
  })

  // Edge cases
  it('pago pendiente exactamente del mes actual día 1 → false', () => {
    const diaUno = new Date('2025-03-01')
    const pago = {
      estado: 'pendiente',
      periodo_mes: 3,
      periodo_anio: 2025,
      created_at: '2025-03-01T00:00:00Z',
    }
    expect(isOverdue(pago, diaUno)).toBe(false)
  })

  it('enero del año siguiente vs diciembre año anterior → true', () => {
    const enero2025 = new Date('2025-01-15')
    const pago = {
      estado: 'pendiente',
      periodo_mes: 12,
      periodo_anio: 2024,
      created_at: '2024-12-01T00:00:00Z',
    }
    expect(isOverdue(pago, enero2025)).toBe(true)
  })
})
