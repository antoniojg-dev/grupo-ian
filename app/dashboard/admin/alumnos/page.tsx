import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAlumnos } from '@/services/alumnos'
import AlumnosList from '@/components/admin/AlumnosList'

export default async function AlumnosPage() {
  const supabase = await createClient()

  const now = new Date()
  const mes = now.getMonth() + 1
  const anio = now.getFullYear()

  const [alumnos, pagosMesResult] = await Promise.allSettled([
    getAlumnos(supabase),
    supabase
      .from('pagos')
      .select('alumno_id')
      .eq('estado', 'pagado')
      .eq('periodo_mes', mes)
      .eq('periodo_anio', anio),
  ])

  const alumnosData = alumnos.status === 'fulfilled' ? alumnos.value : []
  const pagadosIds: string[] =
    pagosMesResult.status === 'fulfilled'
      ? [...new Set((pagosMesResult.value.data ?? []).map((p: { alumno_id: string }) => p.alumno_id))]
      : []

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-fredoka text-2xl lg:text-3xl font-semibold" style={{ color: 'var(--ian-dark)' }}>
              Alumnos
            </h1>
            <p className="font-quicksand text-sm text-gray-500 mt-1">
              {alumnosData.length} alumno{alumnosData.length !== 1 ? 's' : ''} registrado{alumnosData.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/dashboard/admin/alumnos/nuevo"
            className="px-5 py-2.5 rounded-xl font-quicksand text-sm font-semibold text-white transition-opacity hover:opacity-90 flex items-center gap-2"
            style={{ backgroundColor: 'var(--ian-blue)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo alumno
          </Link>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <AlumnosList alumnos={alumnosData} alumnosPagadosIds={pagadosIds} />
        </div>
      </div>
    </main>
  )
}
