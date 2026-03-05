'use client'

import { useState } from 'react'
import { Loader2, CreditCard } from 'lucide-react'
import CheckoutForm from './CheckoutForm'

interface BotonPagarProps {
  alumnoId: string
  servicioId: string
  mes?: number
  anio?: number
  label?: string
}

interface CheckoutData {
  clientSecret: string
  montoFinal: number
  alumnoNombre: string
  concepto: string
}

export default function BotonPagar({
  alumnoId,
  servicioId,
  mes,
  anio,
  label = 'Pagar',
}: BotonPagarProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alumnoId, servicioId, mes, anio }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar el pago')
      }

      // Monto condonado por cupón 100%
      if (data.condonado) {
        window.location.href = '/dashboard/padre/pago-exitoso'
        return
      }

      setCheckoutData({
        clientSecret: data.clientSecret,
        montoFinal: data.montoFinal,
        alumnoNombre: data.alumnoNombre,
        concepto: data.concepto,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setCheckoutData(null)
    setError(null)
  }

  return (
    <>
      {/* Modal de checkout */}
      {checkoutData && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleCancel}
        >
          <CheckoutForm
            clientSecret={checkoutData.clientSecret}
            montoFinal={checkoutData.montoFinal}
            alumnoNombre={checkoutData.alumnoNombre}
            concepto={checkoutData.concepto}
            mes={mes}
            anio={anio}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="flex flex-col items-start gap-1">
        <button
          onClick={handleClick}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-quicksand text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-60"
          style={{ backgroundColor: 'var(--ian-blue)' }}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CreditCard className="w-3.5 h-3.5" />
          )}
          {loading ? 'Cargando...' : label}
        </button>
        {error && (
          <p className="font-quicksand text-xs text-red-500">{error}</p>
        )}
      </div>
    </>
  )
}
