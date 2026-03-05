'use client'

import { useState, useMemo } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { Pago, Alumno, Servicio } from '@/types'

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

// --- Modal de pago manual ---

interface ManualPaymentForm {
  alumnoId: string
  servicioId: string
  mes: number
  anio: number
  metodo: 'efectivo' | 'transferencia' | 'caja'
  referencia: string
  cuponCodigo: string
}

const INITIAL_FORM: ManualPaymentForm = {
  alumnoId: '',
  servicioId: '',
  mes: new Date().getMonth() + 1,
  anio: new Date().getFullYear(),
  metodo: 'efectivo',
  referencia: '',
  cuponCodigo: '',
}

function ModalPagoManual({
  alumnos,
  servicios,
  onClose,
  onSuccess,
}: {
  alumnos: Alumno[]
  servicios: Servicio[]
  onClose: () => void
  onSuccess: (folio: string) => void
}) {
  const [form, setForm] = useState<ManualPaymentForm>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i + 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.alumnoId || !form.servicioId) {
      setError('Selecciona un alumno y un servicio')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/pagos/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumnoId: form.alumnoId,
          servicioId: form.servicioId,
          mes: form.mes,
          anio: form.anio,
          metodo: form.metodo,
          referencia: form.referencia || undefined,
          cuponCodigo: form.cuponCodigo || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al registrar el pago')

      onSuccess(data.folio)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-fredoka text-xl font-semibold mb-5" style={{ color: 'var(--ian-dark)' }}>
          Registrar pago manual
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Alumno */}
          <div>
            <label className="block font-quicksand text-xs font-semibold text-gray-600 mb-1">
              Alumno *
            </label>
            <select
              value={form.alumnoId}
              onChange={(e) => setForm((f) => ({ ...f, alumnoId: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] bg-white"
            >
              <option value="">Seleccionar alumno...</option>
              {alumnos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre} {a.apellido} — {a.grado}
                </option>
              ))}
            </select>
          </div>

          {/* Servicio */}
          <div>
            <label className="block font-quicksand text-xs font-semibold text-gray-600 mb-1">
              Servicio *
            </label>
            <select
              value={form.servicioId}
              onChange={(e) => setForm((f) => ({ ...f, servicioId: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] bg-white"
            >
              <option value="">Seleccionar servicio...</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} — {formatMXN(s.precio_base)}
                </option>
              ))}
            </select>
          </div>

          {/* Mes y Año */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-quicksand text-xs font-semibold text-gray-600 mb-1">
                Mes *
              </label>
              <select
                value={form.mes}
                onChange={(e) => setForm((f) => ({ ...f, mes: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] bg-white"
              >
                {MESES.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-quicksand text-xs font-semibold text-gray-600 mb-1">
                Año *
              </label>
              <select
                value={form.anio}
                onChange={(e) => setForm((f) => ({ ...f, anio: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] bg-white"
              >
                {anios.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <label className="block font-quicksand text-xs font-semibold text-gray-600 mb-1">
              Método de pago *
            </label>
            <div className="flex gap-2">
              {(['efectivo', 'transferencia', 'caja'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, metodo: m }))}
                  className={`flex-1 py-2 rounded-xl font-quicksand text-xs font-semibold capitalize transition-colors border ${
                    form.metodo === m
                      ? 'text-white border-transparent'
                      : 'text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                  style={form.metodo === m ? { backgroundColor: 'var(--ian-blue)' } : {}}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Referencia */}
          <div>
            <label className="block font-quicksand text-xs font-semibold text-gray-600 mb-1">
              Referencia <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              type="text"
              value={form.referencia}
              onChange={(e) => setForm((f) => ({ ...f, referencia: e.target.value }))}
              placeholder="Ej. transferencia #12345"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)]"
            />
          </div>

          {/* Cupón */}
          <div>
            <label className="block font-quicksand text-xs font-semibold text-gray-600 mb-1">
              Código de cupón <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              type="text"
              value={form.cuponCodigo}
              onChange={(e) => setForm((f) => ({ ...f, cuponCodigo: e.target.value.toUpperCase() }))}
              placeholder="Ej. BIENVENIDO2025"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] uppercase"
            />
          </div>

          {error && (
            <p className="font-quicksand text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-quicksand font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'var(--ian-blue)' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registrando...
              </>
            ) : (
              'Registrar pago'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

// --- Tabla principal ---

export default function PagosTable({
  pagos,
  alumnos,
  servicios,
}: {
  pagos: Pago[]
  alumnos: Alumno[]
  servicios: Servicio[]
}) {
  const now = new Date()
  const [mesFiltro, setMesFiltro] = useState(now.getMonth() + 1)
  const [anioFiltro, setAnioFiltro] = useState(now.getFullYear())
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [searchAlumno, setSearchAlumno] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [successFolio, setSuccessFolio] = useState<string | null>(null)

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

  const handleSuccess = (folio: string) => {
    setShowModal(false)
    setSuccessFolio(folio)
    // Recarga la página para ver el pago nuevo
    setTimeout(() => window.location.reload(), 2000)
  }

  return (
    <div>
      {/* Modal pago manual */}
      {showModal && (
        <ModalPagoManual
          alumnos={alumnos}
          servicios={servicios}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Notificación de éxito */}
      {successFolio && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 font-quicksand text-sm text-green-700">
          Pago registrado correctamente — Folio: <strong>{successFolio}</strong>. Actualizando...
        </div>
      )}

      {/* Barra superior: filtros + botón */}
      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div className="flex flex-wrap gap-3 flex-1">
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

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-quicksand text-sm font-semibold text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'var(--ian-blue)' }}
        >
          <Plus className="w-4 h-4" />
          Registrar pago manual
        </button>
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
