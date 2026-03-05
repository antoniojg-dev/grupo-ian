import { describe, it, expect } from 'vitest'
import { generateFolioFormat } from '@/server/payments/generate-folio'

describe('generateFolioFormat', () => {
  it('(2025, 1) → IAN-2025-0001', () => {
    expect(generateFolioFormat(2025, 1)).toBe('IAN-2025-0001')
  })

  it('(2025, 99) → IAN-2025-0099', () => {
    expect(generateFolioFormat(2025, 99)).toBe('IAN-2025-0099')
  })

  it('(2025, 1000) → IAN-2025-1000', () => {
    expect(generateFolioFormat(2025, 1000)).toBe('IAN-2025-1000')
  })

  it('(2026, 1) → IAN-2026-0001', () => {
    expect(generateFolioFormat(2026, 1)).toBe('IAN-2026-0001')
  })

  it('secuencia siempre tiene mínimo 4 dígitos', () => {
    const folio = generateFolioFormat(2025, 7)
    const secuencia = folio.split('-')[2]
    expect(secuencia.length).toBeGreaterThanOrEqual(4)
  })

  it('anio se usa tal cual (no se trunca)', () => {
    const folio = generateFolioFormat(2030, 1)
    expect(folio).toBe('IAN-2030-0001')
  })
})
