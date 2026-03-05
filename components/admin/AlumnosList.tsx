'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { AlumnoConPago } from '@/types'

const GRADOS = [
  'Kinder 1', 'Kinder 2', 'Kinder 3',
  '1° Primaria', '2° Primaria', '3° Primaria',
  '4° Primaria', '5° Primaria', '6° Primaria',
]

type Props = {
  alumnos: AlumnoConPago[]
}

const ESTADO_PAGO_CONFIG = {
  pagado:   { label: 'Al corriente', dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700' },
  pendiente:{ label: 'Pendiente',    dot: 'bg-yellow-500', badge: 'bg-yellow-50 text-yellow-700' },
  vencido:  { label: 'Vencido',      dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700' },
  sin_pago: { label: 'Sin pago',     dot: 'bg-gray-400',   badge: 'bg-gray-50 text-gray-500' },
}

function EstadoPago({ estado }: { estado: AlumnoConPago['estado_pago_mes'] }) {
  const cfg = ESTADO_PAGO_CONFIG[estado]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-quicksand ${cfg.badge}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export default function AlumnosList({ alumnos }: Props) {
  const [search, setSearch] = useState('')
  const [gradoFiltro, setGradoFiltro] = useState('')

  const filtrados = useMemo(() => {
    return alumnos.filter((a) => {
      const nombre = `${a.nombre} ${a.apellido}`.toLowerCase()
      const matchSearch = !search || nombre.includes(search.toLowerCase())
      const matchGrado = !gradoFiltro || a.grado === gradoFiltro
      return matchSearch && matchGrado
    })
  }, [alumnos, search, gradoFiltro])

  return (
    <div>
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] focus:ring-1 focus:ring-[var(--ian-blue)] transition-colors"
        />
        <select
          value={gradoFiltro}
          onChange={(e) => setGradoFiltro(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] transition-colors bg-white"
        >
          <option value="">Todos los grados</option>
          {GRADOS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {filtrados.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-quicksand text-sm">
          No se encontraron alumnos
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-quicksand font-semibold text-gray-600">Alumno</th>
                <th className="text-left px-4 py-3 font-quicksand font-semibold text-gray-600">Grado</th>
                <th className="text-left px-4 py-3 font-quicksand font-semibold text-gray-600 hidden sm:table-cell">Beca</th>
                <th className="text-left px-4 py-3 font-quicksand font-semibold text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-quicksand font-semibold text-gray-600 hidden md:table-cell">Padre</th>
                <th className="text-right px-4 py-3 font-quicksand font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map((alumno) => (
                <tr key={alumno.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold font-fredoka"
                        style={{ backgroundColor: alumno.activo ? 'var(--ian-blue)' : '#9CA3AF' }}
                      >
                        {alumno.nombre[0]}{alumno.apellido[0]}
                      </div>
                      <div>
                        <p className="font-quicksand font-semibold text-gray-800">
                          {alumno.nombre} {alumno.apellido}
                        </p>
                        {!alumno.activo && (
                          <span className="text-xs text-gray-400 font-quicksand">Inactivo</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-quicksand text-gray-600">{alumno.grado}</td>
                  <td className="px-4 py-3 font-quicksand text-gray-600 hidden sm:table-cell">
                    {alumno.beca_porcentaje > 0 ? (
                      <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium">
                        {alumno.beca_porcentaje}%
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Sin beca</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoPago estado={alumno.estado_pago_mes} />
                  </td>
                  <td className="px-4 py-3 font-quicksand text-gray-500 text-xs hidden md:table-cell">
                    {alumno.padre
                      ? `${alumno.padre.nombre ?? ''} ${alumno.padre.apellido ?? ''}`.trim() || '—'
                      : <span className="text-orange-500">Sin asignar</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/admin/alumnos/${alumno.id}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium font-quicksand text-white transition-opacity hover:opacity-80"
                      style={{ backgroundColor: 'var(--ian-blue)' }}
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="font-quicksand text-xs text-gray-400 mt-3">
        {filtrados.length} de {alumnos.length} alumno{alumnos.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
