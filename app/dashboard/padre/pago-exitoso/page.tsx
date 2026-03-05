import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function PagoExitosoPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-md w-full">
        <CheckCircle2
          className="w-16 h-16 mx-auto mb-4"
          style={{ color: 'var(--ian-green)' }}
        />

        <h1 className="font-fredoka text-3xl font-semibold mb-2" style={{ color: 'var(--ian-dark)' }}>
          ¡Pago exitoso!
        </h1>

        <p className="font-quicksand text-sm text-gray-500 mb-2">
          Tu pago fue procesado correctamente.
        </p>

        <p className="font-quicksand text-sm text-gray-400 mb-8">
          Tu recibo será enviado por email cuando esté listo.
        </p>

        <Link
          href="/dashboard/padre/pagos"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-quicksand text-sm font-semibold text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'var(--ian-green)' }}
        >
          Ver mis pagos
        </Link>
      </div>
    </div>
  )
}
