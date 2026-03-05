import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreditCard } from 'lucide-react'
import { getPagosByPadre } from '@/services/pagos'
import { getAlumnosByPadre } from '@/services/alumnos'
import HistorialPagos from '@/components/padre/HistorialPagos'
import { Pago, AlumnoConPago } from '@/types'

export default async function PagosPadrePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let pagos: Pago[] = []
  let hijos: AlumnoConPago[] = []

  try {
    ;[pagos, hijos] = await Promise.all([
      getPagosByPadre(supabase, user.id),
      getAlumnosByPadre(supabase, user.id),
    ])
  } catch {
    // Tabla no existe aun — mostrar vacío
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--ian-blue)' }}
        >
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-fredoka text-2xl lg:text-3xl font-semibold" style={{ color: 'var(--ian-dark)' }}>
            Historial de Pagos
          </h1>
          <p className="font-quicksand text-sm text-gray-500">
            Consulta todos tus pagos y su estado.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <HistorialPagos pagos={pagos} hijos={hijos} />
      </div>
    </div>
  )
}
