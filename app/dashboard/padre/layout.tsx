import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NavbarPadre from '@/components/padre/NavbarPadre'

export default async function PadreLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Rol siempre desde tabla perfiles, nunca desde user_metadata
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, nombre, apellido')
    .eq('id', user.id)
    .single()

  if (perfil?.rol === 'admin') redirect('/dashboard/admin')

  const padreName = perfil?.nombre
    ? `${perfil.nombre}${perfil.apellido ? ' ' + perfil.apellido : ''}`
    : user.email ?? 'Padre'

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <NavbarPadre padreName={padreName} />
      <main>{children}</main>
    </div>
  )
}
