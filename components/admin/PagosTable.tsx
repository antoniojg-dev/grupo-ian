'use client'

import { useState, useMemo } from 'react'
import { Pago } from '@/types'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const ESTADOS = ['pendiente', 'pagado', 'condonado', 'vencido']

const ESTADO_STYLES: Record<string, string> = {
  pagado: 'bg-green-50 text-green-700',
  pendiente: 'bg-yellow-50 text-yellow-700',
  vencido: 'bg-red-50 text-red-700',
  condonado: 'bg-gray-50 text-gray-600',
}

function formatMXN(centavos: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(centavos / 100)
}

function exportCSV(pagos: Pago[]) {
  const headers = ['Folio', 'Alumno', 'Concepto', 'Periodo', 'Monto', 'Estado', 'Fecha', 'Método']
  const rows = pagos.map((p) => [
    p.folio ?? '',
    p.alumnos ? `${p.alumnos.nombre} ${p.alumnos.apellido}` : '',
    p.servicios?.nombre ?? '',
    p.periodo_mes && p.periodo_anio ? `${MESES[p.periodo_mes - 1]} ${p.periodo_anio}` : '',
    (p.monto_final / 100).toFixed(2),
    p.estado,
    p.paid_at ? new Date(p.paid_at).toLocaleDateString('es-MX') : new Date(p.created_at).toLocaleDateString('es-MX'),
    p.metodo_pago ?? '',
  ])

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `pagos-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function PagosTable({ pagos }: { pagos: Pago[] }) {
  const now = new Date()
  const [mesFiltro, setMesFiltro] = useState(now.getMonth() + 1)
  const [anioFiltro, setAnioFiltro] = useState(now.getFullYear())
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [searchAlumno, setSearchAlumno] = useState('')

  const filtrados = useMemo(() => {
    return pagos.filter((p) => {
      const matchMes = !mesFiltro || p.periodo_mes === mesFiltro
      const matchAnio = !anioFiltro || p.periodo_anio === anioFiltro
      const matchEstado = !estadoFiltro || p.estado === estadoFiltro
      const nombre = p.alumnos ? `${p.alumnos.nombre} ${p.alumnos.apellido}`.toLowerCase() : ''
      const matchAlumno = !searchAlumno || nombre.includes(searchAlumno.toLowerCase())
      return matchMes && matchAnio && matchEstado && matchAlumno
    })
  }, [pagos, mesFiltro, anioFiltro, estadoFiltro, searchAlumno])

  const totales = useMemo(() => {
    const cobrado = filtrados.filter((p) => p.estado === 'pagado').reduce((s, p) => s + p.monto_final, 0)
    const pendiente = filtrados.filter((p) => p.estado === 'pendiente').reduce((s, p) => s + p.monto_final, 0)
    const vencido = filtrados.filter((p) => p.estado === 'vencido').reduce((s, p) => s + p.monto_final, 0)
    return { cobrado, pendiente, vencido }
  }, [filtrados])

  const anios = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  return (
    <div>
      {/* Filtros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <select
          value={mesFiltro}
          onChange={(e) => setMesFiltro(Number(e.target.value))}
          className="px-3 py-2 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] bg-white"
        >
          <option value={0}>Todos los meses</option>
          {MESES.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>

        <select
          value={anioFiltro}
          onChange={(e) => setAnioFiltro(Number(e.target.value))}
          className="px-3 py-2 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] bg-white"
        >
          <option value={0}>Todos los años</option>
          {anios.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] bg-white"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Buscar alumno..."
          value={searchAlumno}
          onChange={(e) => setSearchAlumno(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] focus:ring-1 focus:ring-[var(--ian-blue)]"
        />
      </div>

      {/* Tabla */}
      {filtrados.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-quicksand text-sm">
          No se encontraron pagos con los filtros seleccionados
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-quicksand font-semibold text-gray-600 hidden lg:table-cell">Folio</th>
                <th className="text-left px-4 py-3 font-quicksand font-semibold text-gray-600">Alumno</th>
                <th className="text-left px-4 py-3 font-quicksand font-semibold text-gray-600 hidden md:table-cell">Concepto</th>
                <th className="text-left px-4 py-3 font-quicksand font-semibold text-gray-600 hidden sm:table-cell">Periodo</th>
                <th className="text-right px-4 py-3 font-quicksand font-semibold text-gray-600">Monto</th>
                <th className="text-left px-4 py-3 font-quicksand font-semibold text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-quicksand font-semibold text-gray-600 hidden lg:table-cell">Fecha</th>
                <th className="text-left px-4 py-3 font-quicksand font-semibold text-gray-600 hidden xl:table-cell">Método</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-quicksand text-gray-400 text-xs hidden lg:table-cell">
                    {pago.folio ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-quicksand font-medium text-gray-800">
                    {pago.alumnos ? `${pago.alumnos.nombre} ${pago.alumnos.apellido}` : '—'}
                    {pago.alumnos?.grado && (
                      <p className="text-xs text-gray-400 font-normal">{pago.alumnos.grado}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-quicksand text-gray-600 hidden md:table-cell">
                    {pago.servicios?.nombre ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-quicksand text-gray-600 text-xs hidden sm:table-cell">
                    {pago.periodo_mes && pago.periodo_anio
                      ? `${MESES[pago.periodo_mes - 1]} ${pago.periodo_anio}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 font-quicksand font-semibold text-right" style={{ color: 'var(--ian-dark)' }}>
                    {formatMXN(pago.monto_final)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium font-quicksand capitalize ${ESTADO_STYLES[pago.estado] ?? 'bg-gray-50 text-gray-600'}`}>
                      {pago.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-quicksand text-gray-400 text-xs hidden lg:table-cell">
                    {pago.paid_at
                      ? new Date(pago.paid_at).toLocaleDateString('es-MX')
                      : new Date(pago.created_at).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-4 py-3 font-quicksand text-gray-400 text-xs hidden xl:table-cell capitalize">
                    {pago.metodo_pago ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totales + export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-5 pt-5 border-t border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div className="font-quicksand text-sm">
            <span className="text-gray-500">Cobrado: </span>
            <span className="font-semibold text-green-700">{formatMXN(totales.cobrado)}</span>
          </div>
          <div className="font-quicksand text-sm">
            <span className="text-gray-500">Pendiente: </span>
            <span className="font-semibold text-yellow-700">{formatMXN(totales.pendiente)}</span>
          </div>
          <div className="font-quicksand text-sm">
            <span className="text-gray-500">Vencido: </span>
            <span className="font-semibold text-red-700">{formatMXN(totales.vencido)}</span>
          </div>
        </div>
        <button
          onClick={() => exportCSV(filtrados)}
          className="px-4 py-2 rounded-xl border border-gray-200 font-quicksand text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar CSV
        </button>
      </div>
    </div>
  )
}
