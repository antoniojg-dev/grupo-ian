'use client'

import { useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import type { Configuracion } from '@/services/configuracion'

function pesosACentavos(pesos: number) {
  return Math.round(pesos * 100)
}

function centavosAPesos(centavos: number) {
  return centavos / 100
}

function formatPesos(centavos: number) {
  return '$' + centavosAPesos(centavos).toLocaleString('es-MX') + ' MXN'
}

type PrecioItem = {
  clave: string
  label: string
  value: number
}

type ConfigItem = {
  clave: string
  label: string
  value: number
  min: number
  max: number
  unit?: string
}

export default function ConfigPanel({ config }: { config: Configuracion }) {
  const [precios, setPrecios] = useState<Configuracion>(config)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const precioItems: PrecioItem[] = [
    { clave: 'precio_inscripcion', label: 'Inscripción anual', value: precios.precioInscripcion },
    { clave: 'precio_colegiatura', label: 'Colegiatura mensual', value: precios.precioColegiatura },
    { clave: 'precio_semillas_siembra', label: 'Semillas Siembra', value: precios.precioSemillasSiembra },
    { clave: 'precio_semillas_crece', label: 'Semillas Crece', value: precios.precioSemillasCrece },
    { clave: 'precio_semillas_florece', label: 'Semillas Florece', value: precios.precioSemillasFlorece },
  ]

  const configItems: ConfigItem[] = [
    { clave: 'dia_corte', label: 'Día de corte de pago', value: precios.diaCorte, min: 1, max: 31 },
    { clave: 'dia_generacion', label: 'Día de generación de cobros', value: precios.diaGeneracion, min: 1, max: 5 },
    { clave: 'anio_escolar', label: 'Año escolar actual', value: precios.anioEscolar, min: 2020, max: 2100 },
  ]

  function startEditPrecio(item: PrecioItem) {
    setEditingKey(item.clave)
    setEditValue(String(centavosAPesos(item.value)))
    setError(null)
  }

  function startEditConfig(item: ConfigItem) {
    setEditingKey(item.clave)
    setEditValue(String(item.value))
    setError(null)
  }

  function cancelEdit() {
    setEditingKey(null)
    setEditValue('')
    setError(null)
  }

  async function saveEdit(clave: string, isPrecio: boolean) {
    const numVal = Number(editValue)
    if (isNaN(numVal) || numVal < 0) {
      setError('Valor inválido')
      return
    }

    const valorEnCentavos = isPrecio ? pesosACentavos(numVal) : numVal
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave, valor: String(valorEnCentavos) }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al guardar')
        return
      }

      // Update local state
      const fieldMap: Record<string, keyof Configuracion> = {
        precio_inscripcion: 'precioInscripcion',
        precio_colegiatura: 'precioColegiatura',
        precio_semillas_siembra: 'precioSemillasSiembra',
        precio_semillas_crece: 'precioSemillasCrece',
        precio_semillas_florece: 'precioSemillasFlorece',
        dia_corte: 'diaCorte',
        dia_generacion: 'diaGeneracion',
        anio_escolar: 'anioEscolar',
      }
      const field = fieldMap[clave]
      if (field) {
        setPrecios((prev) => ({ ...prev, [field]: valorEnCentavos }))
      }
      setEditingKey(null)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Precios */}
      <section>
        <h2
          className="font-fredoka text-lg font-semibold mb-4"
          style={{ color: 'var(--ian-dark)' }}
        >
          Precios
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {precioItems.map((item) => (
            <div key={item.clave} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
              <p className="font-quicksand text-xs text-gray-500 font-medium uppercase tracking-wide">
                {item.label}
              </p>
              {editingKey === item.clave ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <span className="font-quicksand text-sm text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 font-quicksand text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      autoFocus
                    />
                    <span className="font-quicksand text-sm text-gray-500 whitespace-nowrap">MXN</span>
                  </div>
                  {error && <p className="font-quicksand text-xs text-red-500">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(item.clave, true)}
                      disabled={loading}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-quicksand font-medium text-white transition-colors disabled:opacity-50"
                      style={{ backgroundColor: 'var(--ian-green)' }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={loading}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-quicksand font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p
                    className="font-fredoka text-xl font-semibold"
                    style={{ color: 'var(--ian-dark)' }}
                  >
                    {formatPesos(item.value)}
                  </p>
                  <button
                    onClick={() => startEditPrecio(item)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label={`Editar ${item.label}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Configuración general */}
      <section>
        <h2
          className="font-fredoka text-lg font-semibold mb-4"
          style={{ color: 'var(--ian-dark)' }}
        >
          Configuración general
        </h2>
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
          {configItems.map((item) => (
            <div key={item.clave} className="flex items-center justify-between px-5 py-4">
              <p className="font-quicksand text-sm font-medium text-gray-700">{item.label}</p>
              {editingKey === item.clave ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={item.min}
                    max={item.max}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 font-quicksand text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-200"
                    autoFocus
                  />
                  {error && <p className="font-quicksand text-xs text-red-500">{error}</p>}
                  <button
                    onClick={() => saveEdit(item.clave, false)}
                    disabled={loading}
                    className="p-1.5 rounded-lg text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: 'var(--ian-green)' }}
                    aria-label="Guardar"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={loading}
                    className="p-1.5 rounded-lg text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Cancelar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span
                    className="font-fredoka text-base font-semibold"
                    style={{ color: 'var(--ian-dark)' }}
                  >
                    {item.value}
                  </span>
                  <button
                    onClick={() => startEditConfig(item)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label={`Editar ${item.label}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Nota informativa */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
        <p className="font-quicksand text-sm text-blue-700">
          Los cambios de precio aplican a nuevos cobros. Los cobros ya generados no se modifican.
        </p>
      </div>
    </div>
  )
}
