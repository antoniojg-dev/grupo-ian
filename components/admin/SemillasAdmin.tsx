'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { SEMILLAS_INFO } from '@/config/constants'
import { SemillasStatus } from '@/types'

function formatMXN(centavos: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    centavos / 100
  )
}

type SuscripcionRow = {
  id: string
  paquete: keyof typeof SEMILLAS_INFO
  status: SemillasStatus
  precio_mensual: number
  fecha_inicio: string
  fecha_cancelacion: string | null
  alumnos: { nombre: string; apellido: string; grado: string } | null
  perfiles: { nombre: string | null; apellido: string | null } | null
}

const STATUS_LABELS: Record<SemillasStatus, { label: string; classes: string }> = {
  activa: { label: 'Activa', classes: 'bg-green-50 text-green-700 border-green-200' },
  cancelada: { label: 'Cancelada', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  pausada: { label: 'Pausada', classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  pago_fallido: { label: 'Pago fallido', classes: 'bg-red-50 text-red-700 border-red-200' },
}

type FilterStatus = SemillasStatus | 'todas'

interface SemillasAdminProps {
  suscripciones: SuscripcionRow[]
}

export default function SemillasAdmin({ suscripciones }: SemillasAdminProps) {
  const [filter, setFilter] = useState<FilterStatus>('todas')
  const [cancelando, setCancelando] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [localData, setLocalData] = useState(suscripciones)

  const handleCancelar = async (id: string) => {
    setCancelando(id)
    setError(null)
    try {
      const res = await fetch('/api/semillas/admin/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suscripcionId: id }),
      })
      const data = await res.json()
      if (data.success) {
        setLocalData((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, status: 'cancelada', fecha_cancelacion: new Date().toISOString() }
              : s
          )
        )
      } else {
        setError(data.error ?? 'Error al cancelar')
      }
    } catch {
      setError('Error al conectar con el servidor')
    } finally {
      setCancelando(null)
      setConfirmId(null)
    }
  }

  const filtered =
    filter === 'todas' ? localData : localData.filter((s) => s.status === filter)

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'activa', label: 'Activas' },
    { value: 'cancelada', label: 'Canceladas' },
    { value: 'pago_fallido', label: 'Pago fallido' },
  ]

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg font-quicksand text-sm font-medium transition-colors ${
              filter === opt.value
                ? 'bg-[var(--ian-dark)] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="font-quicksand text-xs text-red-600 bg-red-50 px-4 py-3 rounded-lg">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center border border-gray-100">
          <p className="font-quicksand text-sm text-gray-400">No hay suscripciones para mostrar</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left font-quicksand font-semibold text-gray-500 px-4 py-3 text-xs">
                    Alumno
                  </th>
                  <th className="text-left font-quicksand font-semibold text-gray-500 px-4 py-3 text-xs">
                    Paquete
                  </th>
                  <th className="text-left font-quicksand font-semibold text-gray-500 px-4 py-3 text-xs">
                    Precio
                  </th>
                  <th className="text-left font-quicksand font-semibold text-gray-500 px-4 py-3 text-xs">
                    Padre
                  </th>
                  <th className="text-left font-quicksand font-semibold text-gray-500 px-4 py-3 text-xs">
                    Fecha inicio
                  </th>
                  <th className="text-left font-quicksand font-semibold text-gray-500 px-4 py-3 text-xs">
                    Status
                  </th>
                  <th className="text-left font-quicksand font-semibold text-gray-500 px-4 py-3 text-xs">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const info = SEMILLAS_INFO[s.paquete]
                  const statusStyle = STATUS_LABELS[s.status]
                  return (
                    <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="font-quicksand font-medium text-gray-800">
                          {s.alumnos
                            ? `${s.alumnos.nombre} ${s.alumnos.apellido}`
                            : '—'}
                        </p>
                        <p className="font-quicksand text-xs text-gray-400">
                          {s.alumnos?.grado ?? ''}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" style={{ color: info.color }} />
                          <span className="font-quicksand font-medium text-gray-700">
                            {info.nombre}
                          </span>
                        </div>
                        <p className="font-quicksand text-xs text-gray-400 mt-0.5">{info.horas}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-quicksand font-semibold text-gray-800">
                          {formatMXN(s.precio_mensual)}/mes
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-quicksand text-gray-700">
                          {s.perfiles
                            ? `${s.perfiles.nombre ?? ''} ${s.perfiles.apellido ?? ''}`.trim()
                            : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-quicksand text-gray-600 text-xs">
                          {new Date(s.fecha_inicio).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-quicksand border ${statusStyle.classes}`}
                        >
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {s.status === 'activa' && (
                          <>
                            {confirmId === s.id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCancelar(s.id)}
                                  disabled={cancelando === s.id}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-quicksand text-xs font-semibold text-white transition-opacity disabled:opacity-60"
                                  style={{ backgroundColor: 'var(--ian-red)' }}
                                >
                                  {cancelando === s.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : null}
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => setConfirmId(null)}
                                  className="px-2.5 py-1 rounded-lg font-quicksand text-xs text-gray-500 border border-gray-200 hover:bg-gray-50"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmId(s.id)}
                                className="font-quicksand text-xs text-red-600 hover:text-red-700 hover:underline transition-colors"
                              >
                                Cancelar
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
