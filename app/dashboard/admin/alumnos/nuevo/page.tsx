import Link from 'next/link'
import AlumnoForm from '@/components/admin/AlumnoForm'

export default function NuevoAlumnoPage() {
  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/admin/alumnos"
            className="inline-flex items-center gap-1.5 font-quicksand text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a alumnos
          </Link>
          <h1 className="font-fredoka text-2xl lg:text-3xl font-semibold" style={{ color: 'var(--ian-dark)' }}>
            Nuevo Alumno
          </h1>
          <p className="font-quicksand text-sm text-gray-500 mt-1">
            Registra al alumno e invita al padre a crear su cuenta
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
          <AlumnoForm />
        </div>
      </div>
    </main>
  )
}
