'use client'

import { useState } from 'react'
import { Sparkles, CheckCircle2, Calendar, Loader2 } from 'lucide-react'
import { SEMILLAS_INFO } from '@/config/constants'
import { AlumnoConPago, SemillasPaquete, SemillasSuscripcion } from '@/types'
import SemillasCheckoutModal from './SemillasCheckoutModal'

function formatMXN(centavos: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    centavos / 100
  )
}

interface SemillasCardProps {
  alumno: AlumnoConPago
  suscripcion: SemillasSuscripcion | null
}

export default function SemillasCard({ alumno, suscripcion }: SemillasCardProps) {
  const [selectedPaquete, setSelectedPaquete] = useState<SemillasPaquete | null>(null)
  const [cancelando, setCancelando] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const handleCancelar = async () => {
    if (!suscripcion) return
    setCancelando(true)
    setCancelError(null)
    try {
      const res = await fetch('/api/semillas/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suscripcionId: suscripcion.id }),
      })
      const data = await res.json()
      if (!data.success) {
        setCancelError(data.error ?? 'Error al cancelar')
      } else {
        // Recargar la página para reflejar cambio
        window.location.reload()
      }
    } catch {
      setCancelError('Error al conectar con el servidor')
    } finally {
      setCancelando(false)
      setConfirmCancel(false)
    }
  }

  // Suscripción activa
  if (suscripcion) {
    const info = SEMILLAS_INFO[suscripcion.paquete]
    const fechaInicio = new Date(suscripcion.fecha_inicio).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    return (
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 mt-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: info.color }} />
            <span className="font-fredoka text-base font-semibold" style={{ color: 'var(--ian-dark)' }}>
              Semillas de Sabiduría
            </span>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-quicksand bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 className="w-3 h-3" />
            Activo
          </span>
        </div>

        {/* Info del paquete */}
        <div
          className="rounded-xl p-3 mb-3"
          style={{ backgroundColor: info.color + '12' }}
        >
          <p className="font-fredoka text-base font-semibold" style={{ color: info.color }}>
            Paquete {info.nombre}
          </p>
          <p className="font-quicksand text-xs text-gray-600 mt-0.5">{info.descripcion}</p>
          <p className="font-quicksand text-xs text-gray-500">{info.horas}</p>
          <p className="font-fredoka text-lg font-semibold mt-1.5" style={{ color: info.color }}>
            {formatMXN(suscripcion.precio_mensual)}
            <span className="text-sm font-normal text-gray-500">/mes</span>
          </p>
        </div>

        {/* Fecha inicio */}
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <p className="font-quicksand text-xs text-gray-500">Activo desde: {fechaInicio}</p>
        </div>

        {/* Error */}
        {cancelError && (
          <p className="font-quicksand text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">
            {cancelError}
          </p>
        )}

        {/* Cancelar */}
        {confirmCancel ? (
          <div className="flex items-center gap-2">
            <p className="font-quicksand text-xs text-gray-600 flex-1">
              ¿Seguro que deseas cancelar?
            </p>
            <button
              onClick={handleCancelar}
              disabled={cancelando}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-quicksand text-xs font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: 'var(--ian-red)' }}
            >
              {cancelando ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Sí, cancelar
            </button>
            <button
              onClick={() => setConfirmCancel(false)}
              className="px-3 py-1.5 rounded-lg font-quicksand text-xs text-gray-500 border border-gray-200 hover:bg-gray-50"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmCancel(true)}
            className="font-quicksand text-xs text-red-600 hover:text-red-700 hover:underline transition-colors"
          >
            Cancelar suscripción
          </button>
        )}
      </div>
    )
  }

  // Sin suscripción → mostrar opciones
  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 mt-3">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: '#FF4B6E' }} />
          <span className="font-fredoka text-base font-semibold" style={{ color: 'var(--ian-dark)' }}>
            Semillas de Sabiduría
          </span>
        </div>
        <p className="font-quicksand text-xs text-gray-500 mb-4">
          Extracurriculares de regularización y natación. Elige un paquete mensual.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(SEMILLAS_INFO) as [SemillasPaquete, (typeof SEMILLAS_INFO)[SemillasPaquete]][]).map(
            ([key, info]) => (
              <button
                key={key}
                onClick={() => setSelectedPaquete(key)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ borderColor: info.color + '60', backgroundColor: info.color + '08' }}
              >
                <span
                  className="font-fredoka text-sm font-semibold"
                  style={{ color: info.color }}
                >
                  {info.nombre}
                </span>
                <span className="font-quicksand text-[10px] text-gray-500">{info.horas}</span>
                <span className="font-fredoka text-xs font-semibold" style={{ color: info.color }}>
                  {formatMXN(info.precio)}/mes
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {selectedPaquete && (
        <SemillasCheckoutModal
          isOpen={!!selectedPaquete}
          onClose={() => setSelectedPaquete(null)}
          alumnoId={alumno.id}
          nombreAlumno={`${alumno.nombre} ${alumno.apellido}`}
          paquete={selectedPaquete}
        />
      )}
    </>
  )
}
