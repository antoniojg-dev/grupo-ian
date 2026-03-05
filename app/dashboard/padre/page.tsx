import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { getAlumnosByPadre } from '@/services/alumnos'
import HijoCard from '@/components/padre/HijoCard'
import { AlumnoConPago } from '@/types'

export default async function DashboardPadrePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, apellido')
    .eq('id', user.id)
    .single()

  const nombre = perfil?.nombre ?? user.email ?? 'Padre'

  let hijos: AlumnoConPago[] = []
  try {
    hijos = await getAlumnosByPadre(supabase, user.id)
  } catch {
    // Tabla no existe aún — mostrar vacío
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-10">
      {/* Saludo */}
      <div className="mb-8">
        <h1 className="font-fredoka text-3xl lg:text-4xl font-semibold" style={{ color: 'var(--ian-dark)' }}>
          Hola, {nombre}
        </h1>
        <p className="font-quicksand text-sm text-gray-500 mt-1">
          Aqui esta el resumen de tus hijos.
        </p>
      </div>

      {/* Hijos */}
      {hijos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center border border-gray-100">
          <p className="font-fredoka text-lg font-semibold text-gray-700 mb-2">
            Aun no tienes hijos registrados
          </p>
          <p className="font-quicksand text-sm text-gray-400 mb-6">
            Contacta al administrador para vincular tu cuenta.
          </p>
          <a
            href="https://wa.me/5257807242"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-quicksand text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'var(--ian-green)' }}
          >
            <MessageCircle className="w-4 h-4" />
            Contactar por WhatsApp
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hijos.map((hijo) => (
            <HijoCard key={hijo.id} alumno={hijo} />
          ))}
        </div>
      )}
    </div>
  )
}
