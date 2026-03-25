'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { X, Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import { SEMILLAS_INFO } from '@/config/constants'
import { SemillasPaquete } from '@/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function formatMXN(centavos: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    centavos / 100
  )
}

export interface SemillasCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  alumnoId: string
  nombreAlumno: string
  paquete: SemillasPaquete
}

function SemillasForm({
  paquete,
  nombreAlumno,
  clientSecret,
  onClose,
}: {
  paquete: SemillasPaquete
  nombreAlumno: string
  clientSecret: string
  onClose: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const info = SEMILLAS_INFO[paquete]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)

    const card = elements.getElement(CardElement)
    if (!card) { setSubmitting(false); return }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Error al procesar el pago')
      setSubmitting(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      setSuccess(true)
      setTimeout(() => { onClose(); router.refresh() }, 2500)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
        <CheckCircle2 className="w-14 h-14" style={{ color: '#00B412' }} />
        <h3 className="font-fredoka text-xl font-semibold" style={{ color: 'var(--ian-dark)' }}>
          ¡Suscripción activada!
        </h3>
        <p className="font-quicksand text-sm text-gray-500 max-w-xs">
          Se cobrará {formatMXN(info.precio)} cada mes para el paquete{' '}
          <strong>{info.nombre}</strong>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Resumen del paquete */}
      <div
        className="rounded-xl p-4 border"
        style={{ borderColor: info.color + '40', backgroundColor: info.color + '12' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4" style={{ color: info.color }} />
          <span className="font-fredoka text-base font-semibold" style={{ color: 'var(--ian-dark)' }}>
            Paquete {info.nombre}
          </span>
        </div>
        <p className="font-quicksand text-xs text-gray-600 mb-0.5">{nombreAlumno}</p>
        <p className="font-quicksand text-xs text-gray-500">{info.descripcion}</p>
        <p className="font-quicksand text-xs text-gray-500">{info.horas}</p>
        <p className="font-fredoka text-xl font-semibold mt-2" style={{ color: info.color }}>
          {formatMXN(info.precio)}
          <span className="text-sm font-normal text-gray-500">/mes</span>
        </p>
      </div>

      {/* Tarjeta */}
      <div>
        <label className="block font-quicksand text-xs font-semibold text-gray-600 mb-2">
          Datos de la tarjeta
        </label>
        <div className="border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition-all">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '15px',
                  fontFamily: '"Quicksand", sans-serif',
                  color: '#1A1A2E',
                  '::placeholder': { color: '#9ca3af' },
                },
                invalid: { color: '#E00700' },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <p className="font-quicksand text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !stripe}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-quicksand font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ backgroundColor: info.color }}
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Activando...
          </>
        ) : (
          `Activar suscripción — ${formatMXN(info.precio)}/mes`
        )}
      </button>

      <button
        type="button"
        onClick={onClose}
        className="w-full py-2.5 px-6 rounded-xl font-quicksand text-sm text-gray-500 hover:bg-gray-50 transition-colors"
      >
        Cancelar
      </button>
    </form>
  )
}

export default function SemillasCheckoutModal({
  isOpen,
  onClose,
  alumnoId,
  nombreAlumno,
  paquete,
}: SemillasCheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const info = SEMILLAS_INFO[paquete]

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    setFetchError(null)
    setClientSecret(null)

    fetch('/api/semillas/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumnoId, paquete }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        } else {
          setFetchError(data.error ?? 'Error al iniciar la suscripción')
        }
      })
      .catch(() => setFetchError('Error al conectar con el servidor'))
      .finally(() => setLoading(false))
  }, [isOpen, alumnoId, paquete])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: info.color }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h2 className="font-fredoka text-lg font-semibold text-white">
              Semillas de Sabiduría
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:bg-white/20 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: info.color }} />
              <p className="font-quicksand text-sm text-gray-500">Preparando suscripción...</p>
            </div>
          )}

          {!loading && fetchError && (
            <div className="py-8 text-center">
              <p className="font-quicksand text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                {fetchError}
              </p>
              <button
                onClick={onClose}
                className="mt-4 font-quicksand text-sm text-gray-500 hover:text-gray-700"
              >
                Cerrar
              </button>
            </div>
          )}

          {!loading && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: { theme: 'stripe' } }}
            >
              <SemillasForm
                paquete={paquete}
                nombreAlumno={nombreAlumno}
                clientSecret={clientSecret}
                onClose={onClose}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}
