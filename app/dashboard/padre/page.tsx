import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { WHATSAPP_URL } from '@/config/constants'
import { getAlumnosByPadre } from '@/services/alumnos'
import { getSuscripcionesByPadre } from '@/services/semillas'
import HijoCard from '@/components/padre/HijoCard'
import SemillasCard from '@/components/padre/SemillasCard'
import { AlumnoConPago, SemillasSuscripcion } from '@/types'

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
  let suscripciones: SemillasSuscripcion[] = []

  try {
    [hijos, suscripciones] = await Promise.all([
      getAlumnosByPadre(supabase, user.id),
      getSuscripcionesByPadre(supabase, user.id),
    ])
  } catch {
    // Tablas no existen aún — mostrar vacío
  }

  // Mapa alumnoId → suscripción activa
  const suscripcionMap = new Map<string, SemillasSuscripcion>()
  for (const s of suscripciones) {
    if (s.status === 'activa') {
      suscripcionMap.set(s.alumno_id, s)
    }
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
            href={WHATSAPP_URL}
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
          {hijos.map((hijo) => {
            const esExterno = hijo.tipo === 'externo'
            return (
              <div key={hijo.id}>
                {esExterno ? (
                  /* Alumno externo: solo Semillas, sin colegiatura */
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="font-fredoka text-xl font-semibold mb-1" style={{ color: 'var(--ian-dark)' }}>
                      {hijo.nombre} {hijo.apellido}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-quicksand bg-emerald-50 text-emerald-700 mb-3">
                      Solo Semillas
                    </span>
                    <SemillasCard
                      alumno={hijo}
                      suscripcion={suscripcionMap.get(hijo.id) ?? null}
                    />
                  </div>
                ) : (
                  /* Alumno interno: colegiatura + Semillas */
                  <>
                    <HijoCard alumno={hijo} />
                    <SemillasCard
                      alumno={hijo}
                      suscripcion={suscripcionMap.get(hijo.id) ?? null}
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
