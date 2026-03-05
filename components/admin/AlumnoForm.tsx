'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAlumnoAction, invitarPadreAction } from '@/app/dashboard/admin/actions'

const GRADOS = [
  'Kinder 1', 'Kinder 2', 'Kinder 3',
  '1° Primaria', '2° Primaria', '3° Primaria',
  '4° Primaria', '5° Primaria', '6° Primaria',
]

const GRUPOS = ['A', 'B', 'C']

export default function AlumnoForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [alumno, setAlumno] = useState({
    nombre: '',
    apellido: '',
    grado: '',
    grupo: 'A',
    beca_porcentaje: 0,
  })

  const [padre, setPadre] = useState({
    email: '',
    nombre: '',
    apellido: '',
  })

  function validarPaso1() {
    if (!alumno.nombre.trim()) return 'El nombre es requerido'
    if (!alumno.apellido.trim()) return 'El apellido es requerido'
    if (!alumno.grado) return 'El grado es requerido'
    if (alumno.beca_porcentaje < 0 || alumno.beca_porcentaje > 100) return 'La beca debe estar entre 0 y 100'
    return null
  }

  function validarPaso2() {
    if (!padre.email.trim()) return 'El email del padre es requerido'
    if (!padre.nombre.trim()) return 'El nombre del padre es requerido'
    if (!padre.apellido.trim()) return 'El apellido del padre es requerido'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(padre.email)) return 'El email no es válido'
    return null
  }

  function handleNextStep() {
    const err = validarPaso1()
    if (err) { setError(err); return }
    setError(null)
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validarPaso2()
    if (err) { setError(err); return }

    setLoading(true)
    setError(null)

    try {
      const nuevoAlumno = await createAlumnoAction({
        nombre: alumno.nombre.trim(),
        apellido: alumno.apellido.trim(),
        grado: alumno.grado,
        grupo: alumno.grupo,
        beca_porcentaje: alumno.beca_porcentaje,
      })

      await invitarPadreAction(
        padre.email.trim().toLowerCase(),
        padre.nombre.trim(),
        padre.apellido.trim(),
        nuevoAlumno.id
      )

      router.push('/dashboard/admin/alumnos')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Indicador de pasos */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold font-fredoka transition-colors ${
                step >= n ? 'text-white' : 'text-gray-400 bg-gray-100'
              }`}
              style={step >= n ? { backgroundColor: 'var(--ian-blue)' } : {}}
            >
              {n}
            </div>
            <span
              className={`font-quicksand text-sm ${step >= n ? 'text-gray-800 font-medium' : 'text-gray-400'}`}
            >
              {n === 1 ? 'Datos del alumno' : 'Invitar al padre'}
            </span>
            {n < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 font-quicksand text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Paso 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-quicksand text-sm font-medium text-gray-700 mb-1.5">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={alumno.nombre}
                onChange={(e) => setAlumno({ ...alumno, nombre: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] focus:ring-1 focus:ring-[var(--ian-blue)]"
                placeholder="Ej: Luis"
              />
            </div>
            <div>
              <label className="block font-quicksand text-sm font-medium text-gray-700 mb-1.5">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={alumno.apellido}
                onChange={(e) => setAlumno({ ...alumno, apellido: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] focus:ring-1 focus:ring-[var(--ian-blue)]"
                placeholder="Ej: García"
              />
            </div>
          </div>

          <div>
            <label className="block font-quicksand text-sm font-medium text-gray-700 mb-1.5">
              Grado <span className="text-red-500">*</span>
            </label>
            <select
              value={alumno.grado}
              onChange={(e) => setAlumno({ ...alumno, grado: e.target.value })}
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
                value={alumno.grupo}
                onChange={(e) => setAlumno({ ...alumno, grupo: e.target.value })}
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
                value={alumno.beca_porcentaje}
                onChange={(e) => setAlumno({ ...alumno, beca_porcentaje: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] focus:ring-1 focus:ring-[var(--ian-blue)]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            className="w-full py-3 rounded-xl font-quicksand font-semibold text-sm text-white mt-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--ian-blue)' }}
          >
            Continuar →
          </button>
        </div>
      )}

      {/* Paso 2 */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 mb-2">
            <p className="font-quicksand text-xs text-blue-700">
              Se enviará un email de invitación al padre para que cree su contraseña y acceda al portal.
            </p>
          </div>

          <div>
            <label className="block font-quicksand text-sm font-medium text-gray-700 mb-1.5">
              Email del padre <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={padre.email}
              onChange={(e) => setPadre({ ...padre, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] focus:ring-1 focus:ring-[var(--ian-blue)]"
              placeholder="padre@ejemplo.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-quicksand text-sm font-medium text-gray-700 mb-1.5">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={padre.nombre}
                onChange={(e) => setPadre({ ...padre, nombre: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] focus:ring-1 focus:ring-[var(--ian-blue)]"
                placeholder="Ej: Carlos"
              />
            </div>
            <div>
              <label className="block font-quicksand text-sm font-medium text-gray-700 mb-1.5">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={padre.apellido}
                onChange={(e) => setPadre({ ...padre, apellido: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:border-[var(--ian-blue)] focus:ring-1 focus:ring-[var(--ian-blue)]"
                placeholder="Ej: García"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setStep(1); setError(null) }}
              className="flex-1 py-3 rounded-xl font-quicksand font-medium text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              ← Volver
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-3 rounded-xl font-quicksand font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: 'var(--ian-green)' }}
            >
              {loading ? 'Creando...' : 'Crear alumno e invitar padre'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
