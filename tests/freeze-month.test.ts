import { describe, it, expect } from 'vitest'
import { isMonthFrozen } from '@/server/payments/freeze-month'

const alumnoId = 'alumno-123'

describe('isMonthFrozen', () => {
  it('mes congelado → true', () => {
    const congelaciones = [{ alumno_id: alumnoId, mes: 3, anio: 2025 }]
    expect(isMonthFrozen(congelaciones, 3, 2025)).toBe(true)
  })

  it('mes no congelado → false', () => {
    const congelaciones = [{ alumno_id: alumnoId, mes: 3, anio: 2025 }]
    expect(isMonthFrozen(congelaciones, 4, 2025)).toBe(false)
  })

  it('array vacío → false', () => {
    expect(isMonthFrozen([], 3, 2025)).toBe(false)
  })

  it('mismo mes diferente año → false', () => {
    const congelaciones = [{ alumno_id: alumnoId, mes: 3, anio: 2025 }]
    expect(isMonthFrozen(congelaciones, 3, 2026)).toBe(false)
  })

  it('diferente mes mismo año → false', () => {
    const congelaciones = [{ alumno_id: alumnoId, mes: 3, anio: 2025 }]
    expect(isMonthFrozen(congelaciones, 5, 2025)).toBe(false)
  })

  // Edge cases
  it('múltiples congelaciones → encuentra la correcta', () => {
    const congelaciones = [
      { alumno_id: alumnoId, mes: 1, anio: 2025 },
      { alumno_id: alumnoId, mes: 6, anio: 2025 },
      { alumno_id: 'otro-alumno', mes: 3, anio: 2025 },
      { alumno_id: alumnoId, mes: 3, anio: 2025 },
    ]
    expect(isMonthFrozen(congelaciones, 3, 2025)).toBe(true)
    expect(isMonthFrozen(congelaciones, 6, 2025)).toBe(true)
    expect(isMonthFrozen(congelaciones, 4, 2025)).toBe(false)
  })

  it('diciembre año anterior vs enero año actual → false', () => {
    const congelaciones = [{ alumno_id: alumnoId, mes: 12, anio: 2024 }]
    expect(isMonthFrozen(congelaciones, 1, 2025)).toBe(false)
  })
})
