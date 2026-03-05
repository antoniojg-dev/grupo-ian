import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function PagoCanceladoPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-md w-full">
        <XCircle
          className="w-16 h-16 mx-auto mb-4"
          style={{ color: 'var(--ian-red)' }}
        />

        <h1 className="font-fredoka text-3xl font-semibold mb-2" style={{ color: 'var(--ian-dark)' }}>
          Pago no completado
        </h1>

        <p className="font-quicksand text-sm text-gray-500 mb-8">
          Puedes intentarlo de nuevo cuando quieras. Tu saldo no fue afectado.
        </p>

        <Link
          href="/dashboard/padre/pagos"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-quicksand text-sm font-semibold text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'var(--ian-red)' }}
        >
          Volver a mis pagos
        </Link>
      </div>
    </div>
  )
}
