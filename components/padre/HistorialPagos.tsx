'use client'

import { useState, useMemo } from 'react'
import PagoStatusBadge from './PagoStatusBadge'
import BotonPagar from './BotonPagar'
import BotonRecibo from '@/components/BotonRecibo'
import { Pago, AlumnoConPago } from '@/types'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function formatMXN(centavos: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(centavos / 100)
}

function formatPeriodo(mes: number | null, anio: number | null) {
  if (!mes || !anio) return '—'
  return `${MESES[mes - 1]} ${anio}`
}

function formatFecha(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function HistorialPagos({
  pagos,
  hijos,
}: {
  pagos: Pago[]
  hijos: AlumnoConPago[]
}) {
  const [filtroAlumno, setFiltroAlumno] = useState<string>('todos')
  const [filtroAnio, setFiltroAnio] = useState<string>('todos')

  const aniosDisponibles = useMemo(() => {
    const set = new Set(pagos.map((p) => p.periodo_anio).filter(Boolean) as number[])
    return Array.from(set).sort((a, b) => b - a)
  }, [pagos])

  const pagosFiltrados = useMemo(() => {
    return pagos.filter((p) => {
      if (filtroAlumno !== 'todos' && p.alumno_id !== filtroAlumno) return false
      if (filtroAnio !== 'todos' && String(p.periodo_anio) !== filtroAnio) return false
      return true
    })
  }, [pagos, filtroAlumno, filtroAnio])

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        {hijos.length > 1 && (
          <div>
            <label className="block font-quicksand text-xs text-gray-500 mb-1">Alumno</label>
            <select
              value={filtroAlumno}
              onChange={(e) => setFiltroAlumno(e.target.value)}
              className="font-quicksand text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="todos">Todos</option>
              {hijos.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nombre} {h.apellido}
                </option>
              ))}
            </select>
          </div>
        )}

        {aniosDisponibles.length > 0 && (
          <div>
            <label className="block font-quicksand text-xs text-gray-500 mb-1">Año</label>
            <select
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(e.target.value)}
              className="font-quicksand text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="todos">Todos</option>
              {aniosDisponibles.map((a) => (
                <option key={a} value={String(a)}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabla */}
      {pagosFiltrados.length === 0 ? (
        <div className="text-center py-14">
          <p className="font-quicksand text-sm text-gray-400">Aun no tienes pagos registrados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Folio', 'Alumno', 'Concepto', 'Periodo', 'Monto', 'Estado', 'Fecha', ''].map((col) => (
                  <th
                    key={col}
                    className="text-left font-quicksand font-semibold text-xs text-gray-400 uppercase tracking-wide pb-3 pr-4 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pagosFiltrados.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 font-quicksand text-xs text-gray-400 whitespace-nowrap">
                    {pago.folio ?? '—'}
                  </td>
                  <td className="py-3 pr-4 font-quicksand text-sm text-gray-700 whitespace-nowrap">
                    {pago.alumnos
                      ? `${pago.alumnos.nombre} ${pago.alumnos.apellido}`
                      : '—'}
                  </td>
                  <td className="py-3 pr-4 font-quicksand text-sm text-gray-700">
                    {pago.servicios?.nombre ?? '—'}
                  </td>
                  <td className="py-3 pr-4 font-quicksand text-sm text-gray-700 whitespace-nowrap">
                    {formatPeriodo(pago.periodo_mes, pago.periodo_anio)}
                  </td>
                  <td className="py-3 pr-4 font-quicksand text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {formatMXN(pago.monto_final)}
                  </td>
                  <td className="py-3 pr-4">
                    <PagoStatusBadge estado={pago.estado} />
                  </td>
                  <td className="py-3 pr-4 font-quicksand text-xs text-gray-400 whitespace-nowrap">
                    {formatFecha(pago.paid_at ?? pago.created_at)}
                  </td>
                  <td className="py-3">
                    {(pago.estado === 'pendiente' || pago.estado === 'vencido') &&
                    pago.servicio_id ? (
                      <BotonPagar
                        alumnoId={pago.alumno_id}
                        servicioId={pago.servicio_id}
                        mes={pago.periodo_mes ?? undefined}
                        anio={pago.periodo_anio ?? undefined}
                        label="Pagar"
                      />
                    ) : pago.estado === 'pagado' && pago.folio ? (
                      <BotonRecibo folio={pago.folio} pdfUrl={pago.pdf_url} />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
