import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Rol siempre desde tabla perfiles, nunca desde user_metadata
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, nombre, apellido')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'admin') redirect('/dashboard/padre')

  const adminName = perfil?.nombre
    ? `${perfil.nombre}${perfil.apellido ? ' ' + perfil.apellido : ''}`
    : user.email ?? 'Admin'

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Sidebar adminName={adminName} />

      {/* Contenido principal — offset para el sidebar en desktop */}
      <div className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        {children}
      </div>
    </div>
  )
}
