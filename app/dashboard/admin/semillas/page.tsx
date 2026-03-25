import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { getSuscripcionesAdmin } from '@/services/semillas'
import SemillasAdmin from '@/components/admin/SemillasAdmin'

export default async function AdminSemillasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'admin') redirect('/dashboard/padre')

  let suscripciones: Awaited<ReturnType<typeof getSuscripcionesAdmin>> = []
  try {
    suscripciones = await getSuscripcionesAdmin(supabase)
  } catch {
    // Tabla no existe aún
  }

  const activas = suscripciones.filter((s) => s.status === 'activa').length
  const total = suscripciones.length

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5" style={{ color: '#FF4B6E' }} />
            <h1
              className="font-fredoka text-2xl lg:text-3xl font-semibold"
              style={{ color: 'var(--ian-dark)' }}
            >
              Semillas de Sabiduría — Suscripciones
            </h1>
          </div>
          <p className="font-quicksand text-sm text-gray-500">
            {activas} activas · {total} en total
          </p>
        </div>

        <SemillasAdmin suscripciones={suscripciones as Parameters<typeof SemillasAdmin>[0]['suscripciones']} />
      </div>
    </main>
  )
}
