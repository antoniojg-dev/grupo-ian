import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAlumnoById } from '@/services/alumnos'
import AlumnoEditForm from '@/components/admin/AlumnoEditForm'

export default async function EditarAlumnoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Verificar auth admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'admin') redirect('/dashboard/padre')

  let alumno
  try {
    alumno = await getAlumnoById(supabase, id)
  } catch {
    notFound()
  }

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href={`/dashboard/admin/alumnos/${id}`}
            className="inline-flex items-center gap-1.5 font-quicksand text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {alumno.nombre} {alumno.apellido}
          </Link>
          <h1 className="font-fredoka text-2xl lg:text-3xl font-semibold" style={{ color: 'var(--ian-dark)' }}>
            Editar alumno
          </h1>
          <p className="font-quicksand text-sm text-gray-500 mt-1">
            Actualiza los datos de {alumno.nombre} {alumno.apellido}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
          <AlumnoEditForm alumno={alumno} />
        </div>
      </div>
    </main>
  )
}
