'use client'

import { useState } from 'react'
import { updateAlumnoFullAction } from '@/app/dashboard/admin/actions'
import { Alumno } from '@/types'

const GRADOS = [
  'Preprimaria', 'Kinder 1', 'Kinder 2', 'Kinder 3',
]

const GRUPOS = ['A', 'B', 'C']

type Props = {
  alumno: Alumno
}

export default function AlumnoEditForm({ alumno }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nombre: alumno.nombre,
    apellido: alumno.apellido,
    tipo: alumno.tipo,
    grado: alumno.grado ?? '',
    grupo: alumno.grupo ?? 'A',
    beca_porcentaje: alumno.beca_porcentaje,
    activo: alumno.activo,
  })

  const tipoChanged = form.tipo !== alumno.tipo

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await updateAlumnoFullAction(alumno.id, {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        tipo: form.tipo,
        grado: form.tipo === 'interno' ? form.grado : undefined,
        grupo: form.tipo === 'interno' ? form.grupo : undefined,
        beca_porcentaje: form.tipo === 'interno' ? form.beca_porcentaje : 0,
        activo: form.activo,
      })
      // redirect happens server-side
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar cambios')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 font-quicksand text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-quicksand text-sm font-medium text-gray-700 mb-1.5">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] focus:ring-1 focus:ring-[var(--ian-blue)]"
          />
        </div>
        <div>
          <label className="block font-quicksand text-sm font-medium text-gray-700 mb-1.5">
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.apellido}
            onChange={(e) => setForm({ ...form, apellido: e.target.value })}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] focus:ring-1 focus:ring-[var(--ian-blue)]"
          />
        </div>
      </div>

      {/* Tipo */}
      <div>
        <label className="block font-quicksand text-sm font-medium text-gray-700 mb-2">
          Tipo de alumno
        </label>
        <div className="flex gap-3">
          {(['interno', 'externo'] as const).map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => setForm({ ...form, tipo })}
              className={`flex-1 py-2.5 px-4 rounded-xl border-2 font-quicksand text-sm font-medium transition-all ${
                form.tipo === tipo
                  ? 'border-[var(--ian-blue)] text-[var(--ian-blue)] bg-blue-50'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {tipo === 'interno' ? '🏫 Interno (kinder)' : '🌱 Externo (solo Semillas)'}
            </button>
          ))}
        </div>
        {tipoChanged && form.tipo === 'externo' && (
          <p className="mt-2 text-xs font-quicksand text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
            Cambiar a externo ocultará la colegiatura en el dashboard del padre
          </p>
        )}
      </div>

      {/* Grado, Grupo, Beca: solo internos */}
      {form.tipo === 'interno' && (
        <>
          <div>
            <label className="block font-quicksand text-sm font-medium text-gray-700 mb-1.5">
              Grado
            </label>
            <select
              value={form.grado}
              onChange={(e) => setForm({ ...form, grado: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] bg-white"
            >
              <option value="">Seleccionar grado...</option>
              {GRADOS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-quicksand text-sm font-medium text-gray-700 mb-1.5">
                Grupo
              </label>
              <select
                value={form.grupo}
                onChange={(e) => setForm({ ...form, grupo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] bg-white"
              >
                {GRUPOS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-quicksand text-sm font-medium text-gray-700 mb-1.5">
                Beca %
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.beca_porcentaje}
                onChange={(e) => setForm({ ...form, beca_porcentaje: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] focus:ring-1 focus:ring-[var(--ian-blue)]"
              />
            </div>
          </div>
        </>
      )}

      {/* Activo / Inactivo */}
      <div>
        <label className="block font-quicksand text-sm font-medium text-gray-700 mb-2">
          Estado
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, activo: !form.activo })}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              form.activo ? 'bg-[var(--ian-green)]' : 'bg-gray-200'
            }`}
            aria-checked={form.activo}
            role="switch"
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                form.activo ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`font-quicksand text-sm font-medium ${form.activo ? 'text-green-700' : 'text-gray-500'}`}>
            {form.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <a
          href={`/dashboard/admin/alumnos/${alumno.id}`}
          className="flex-1 py-3 rounded-xl font-quicksand font-medium text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors text-center"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={loading}
          className="flex-[2] py-3 rounded-xl font-quicksand font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: 'var(--ian-blue)' }}
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
