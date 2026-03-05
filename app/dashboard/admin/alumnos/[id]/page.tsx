import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAlumnoById } from '@/services/alumnos'
import AlumnoDetailEdit from '@/components/admin/AlumnoDetailEdit'
import { Pago } from '@/types'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const ESTADO_STYLES: Record<string, string> = {
  pagado: 'bg-green-50 text-green-700',
  pendiente: 'bg-yellow-50 text-yellow-700',
  vencido: 'bg-red-50 text-red-700',
  condonado: 'bg-gray-50 text-gray-600',
}

function formatMXN(centavos: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(centavos / 100)
}

export default async function AlumnoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  let alumno
  try {
    alumno = await getAlumnoById(supabase, id)
  } catch {
    notFound()
  }

  const pagos: Pago[] = alumno.pagos ?? []

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard/admin/alumnos"
            className="inline-flex items-center gap-1.5 font-quicksand text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Alumnos
          </Link>
          <h1 className="font-fredoka text-2xl lg:text-3xl font-semibold" style={{ color: 'var(--ian-dark)' }}>
            {alumno.nombre} {alumno.apellido}
          </h1>
          <p className="font-quicksand text-sm text-gray-500 mt-1">
            {alumno.grado}{alumno.grupo ? ` — Grupo ${alumno.grupo}` : ''}
          </p>
        </div>

        <div className="space-y-6">
          {/* Datos del alumno — editable */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <AlumnoDetailEdit alumno={alumno} />
          </div>

          {/* Padre */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-fredoka text-lg font-semibold mb-4" style={{ color: 'var(--ian-dark)' }}>
              Padre / Tutor
            </h2>
            {alumno.padre ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold font-fredoka"
                  style={{ backgroundColor: 'var(--ian-blue)' }}
                >
                  {(alumno.padre as { nombre?: string | null }).nombre?.[0] ?? '?'}
                </div>
                <div>
                  <p className="font-quicksand font-semibold text-sm text-gray-800">
                    {(alumno.padre as { nombre?: string | null; apellido?: string | null }).nombre ?? ''}{' '}
                    {(alumno.padre as { apellido?: string | null }).apellido ?? ''}
                  </p>
                  <p className="font-quicksand text-xs text-gray-400">Padre/Tutor asignado</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="font-quicksand text-sm text-orange-600">Sin padre asignado</p>
                <Link
                  href={`/dashboard/admin/alumnos/nuevo?alumno=${alumno.id}`}
                  className="px-3 py-1.5 rounded-lg font-quicksand text-xs font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--ian-orange)' }}
                >
                  Invitar padre
                </Link>
              </div>
            )}
          </div>

          {/* Historial de pagos */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-fredoka text-lg font-semibold mb-4" style={{ color: 'var(--ian-dark)' }}>
              Historial de pagos
            </h2>
            {pagos.length === 0 ? (
              <p className="font-quicksand text-sm text-gray-400 text-center py-6">Sin pagos registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 font-quicksand font-semibold text-gray-500 text-xs">Concepto</th>
                      <th className="text-left px-4 py-2.5 font-quicksand font-semibold text-gray-500 text-xs hidden sm:table-cell">Periodo</th>
                      <th className="text-right px-4 py-2.5 font-quicksand font-semibold text-gray-500 text-xs">Monto</th>
                      <th className="text-left px-4 py-2.5 font-quicksand font-semibold text-gray-500 text-xs">Estado</th>
                      <th className="text-left px-4 py-2.5 font-quicksand font-semibold text-gray-500 text-xs hidden md:table-cell">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pagos.map((pago) => (
                      <tr key={pago.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-quicksand text-sm text-gray-700">
                          {(pago.servicios as { nombre?: string } | null)?.nombre ?? 'Pago'}
                        </td>
                        <td className="px-4 py-3 font-quicksand text-xs text-gray-500 hidden sm:table-cell">
                          {pago.periodo_mes && pago.periodo_anio
                            ? `${MESES[pago.periodo_mes - 1]} ${pago.periodo_anio}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 font-quicksand font-semibold text-sm text-right" style={{ color: 'var(--ian-dark)' }}>
                          {formatMXN(pago.monto_final)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium font-quicksand capitalize ${ESTADO_STYLES[pago.estado] ?? 'bg-gray-50 text-gray-600'}`}>
                            {pago.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-quicksand text-xs text-gray-400 hidden md:table-cell">
                          {pago.paid_at
                            ? new Date(pago.paid_at).toLocaleDateString('es-MX')
                            : new Date(pago.created_at).toLocaleDateString('es-MX')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
