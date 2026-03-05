'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { X, CreditCard, Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function formatMXN(centavos: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    centavos / 100
  )
}

export interface CheckoutFormProps {
  clientSecret: string
  concepto: string
  alumnoNombre: string
  montoFinal: number
  mes?: number
  anio?: number
  onCancel: () => void
}

function CheckoutFormInner({
  clientSecret,
  concepto,
  alumnoNombre,
  montoFinal,
  mes,
  anio,
  onCancel,
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const periodo = mes && anio ? `${MESES[mes - 1]} ${anio}` : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    console.log('clientSecret recibido:', clientSecret)

    const card = elements.getElement(CardElement)
    if (!card) {
      console.log('CardElement no encontrado')
      setLoading(false)
      return
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    })

    console.log('Resultado confirmación:', result)
    console.log('Error si hay:', result.error)

    const { error: stripeError, paymentIntent } = result

    if (stripeError) {
      setError(stripeError.message ?? 'Error al procesar el pago')
      setLoading(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      router.push('/dashboard/padre/pago-exitoso')
    }
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Cerrar */}
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Cerrar"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--ian-blue)' }}
        >
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-fredoka text-xl font-semibold" style={{ color: 'var(--ian-dark)' }}>
            Completar pago
          </h2>
          <p className="font-quicksand text-xs text-gray-400">Pago seguro con Stripe</p>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
        <p className="font-quicksand text-sm font-semibold text-gray-700">{concepto}</p>
        <p className="font-quicksand text-xs text-gray-500 mt-0.5">
          {alumnoNombre}
          {periodo ? ` · ${periodo}` : ''}
        </p>
        <p
          className="font-fredoka text-2xl font-semibold mt-2"
          style={{ color: 'var(--ian-blue)' }}
        >
          {formatMXN(montoFinal)}
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
          disabled={loading || !stripe}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-quicksand font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: 'var(--ian-blue)' }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : (
            `Pagar ${formatMXN(montoFinal)}`
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2.5 px-6 rounded-xl font-quicksand text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </form>
    </div>
  )
}

export default function CheckoutForm(props: CheckoutFormProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: props.clientSecret,
        appearance: { theme: 'stripe' },
      }}
    >
      <CheckoutFormInner {...props} />
    </Elements>
  )
}
