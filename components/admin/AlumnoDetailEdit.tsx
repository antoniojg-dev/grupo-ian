'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateAlumnoAction, toggleAlumnoActivoAction } from '@/app/dashboard/admin/actions'
import { Alumno } from '@/types'

const GRADOS = [
  'Preprimaria', 'Kinder 1', 'Kinder 2', 'Kinder 3',
]

const GRUPOS = ['A', 'B', 'C']

type Props = {
  alumno: Alumno
}

export default function AlumnoDetailEdit({ alumno }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nombre: alumno.nombre,
    apellido: alumno.apellido,
    grado: alumno.grado,
    grupo: alumno.grupo ?? 'A',
    beca_porcentaje: alumno.beca_porcentaje,
  })

  async function handleSave() {
    setLoading(true)
    setError(null)
    try {
      await updateAlumnoAction(alumno.id, form)
      setEditing(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActivo() {
    if (!confirm(`¿${alumno.activo ? 'Desactivar' : 'Activar'} a ${alumno.nombre} ${alumno.apellido}?`)) return
    setLoading(true)
    try {
      await toggleAlumnoActivoAction(alumno.id, !alumno.activo)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cambiar estado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header de la card */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-fredoka text-lg font-semibold" style={{ color: 'var(--ian-dark)' }}>
          Datos del alumno
        </h2>
        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 font-quicksand text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Editar
            </button>
          ) : (
            <>
              <button
                onClick={() => { setEditing(false); setError(null) }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 font-quicksand text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg font-quicksand text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: 'var(--ian-green)' }}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 font-quicksand text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Campos */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label className="block font-quicksand text-xs text-gray-500 mb-1">Nombre</label>
          {editing ? (
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)]"
            />
          ) : (
            <p className="font-quicksand text-sm font-medium text-gray-800">{alumno.nombre}</p>
          )}
        </div>

        {/* Apellido */}
        <div>
          <label className="block font-quicksand text-xs text-gray-500 mb-1">Apellido</label>
          {editing ? (
            <input
              value={form.apellido}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)]"
            />
          ) : (
            <p className="font-quicksand text-sm font-medium text-gray-800">{alumno.apellido}</p>
          )}
        </div>

        {/* Grado */}
        <div>
          <label className="block font-quicksand text-xs text-gray-500 mb-1">Grado</label>
          {editing ? (
            <select
              value={form.grado}
              onChange={(e) => setForm({ ...form, grado: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] bg-white"
            >
              {GRADOS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          ) : (
            <p className="font-quicksand text-sm font-medium text-gray-800">{alumno.grado}</p>
          )}
        </div>

        {/* Grupo */}
        <div>
          <label className="block font-quicksand text-xs text-gray-500 mb-1">Grupo</label>
          {editing ? (
            <select
              value={form.grupo}
              onChange={(e) => setForm({ ...form, grupo: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] bg-white"
            >
              {GRUPOS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          ) : (
            <p className="font-quicksand text-sm font-medium text-gray-800">{alumno.grupo ?? '—'}</p>
          )}
        </div>

        {/* Beca */}
        <div>
          <label className="block font-quicksand text-xs text-gray-500 mb-1">Beca %</label>
          {editing ? (
            <input
              type="number"
              min={0}
              max={100}
              value={form.beca_porcentaje}
              onChange={(e) => setForm({ ...form, beca_porcentaje: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)]"
            />
          ) : (
            <p className="font-quicksand text-sm font-medium text-gray-800">
              {alumno.beca_porcentaje > 0
                ? <span className="text-purple-700">{alumno.beca_porcentaje}%</span>
                : 'Sin beca'}
            </p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label className="block font-quicksand text-xs text-gray-500 mb-1">Estado</label>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-quicksand ${alumno.activo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <span className={`w-2 h-2 rounded-full ${alumno.activo ? 'bg-green-500' : 'bg-gray-400'}`} />
              {alumno.activo ? 'Activo' : 'Inactivo'}
            </span>
            <button
              onClick={handleToggleActivo}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg border border-gray-200 font-quicksand text-xs text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {alumno.activo ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
