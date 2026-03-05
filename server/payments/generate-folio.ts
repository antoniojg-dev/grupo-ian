export function generateFolioFormat(anio: number, secuencia: number): string {
  const secuenciaStr = String(secuencia).padStart(4, '0')
  return `IAN-${anio}-${secuenciaStr}`
}
