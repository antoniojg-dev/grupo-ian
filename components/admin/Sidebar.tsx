'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings } from 'lucide-react'
import { logoutAction } from '@/app/dashboard/admin/actions'

type NavLink = {
  href: string
  label: string
  exact?: boolean
  emoji?: string
  icon?: React.ReactNode
}

const NAV_LINKS: NavLink[] = [
  { href: '/dashboard/admin', label: 'Resumen', emoji: '🏠', exact: true },
  { href: '/dashboard/admin/alumnos', label: 'Alumnos', emoji: '👨‍👧' },
  { href: '/dashboard/admin/pagos', label: 'Pagos', emoji: '💳' },
  { href: '/dashboard/admin/cupones', label: 'Cupones', emoji: '🎟️' },
  { href: '/dashboard/admin/config', label: 'Configuración', icon: <Settings className="w-4 h-4" /> },
]

export default function Sidebar({ adminName }: { adminName: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <p className="font-fredoka text-xl font-semibold text-white tracking-wide">Grupo IAN</p>
        <p className="font-quicksand text-xs text-white/50 mt-0.5">Panel de Administración</p>
      </div>

      {/* Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-quicksand text-sm font-medium transition-colors ${
              isActive(link.href, link.exact)
                ? 'bg-white/15 text-white'
                : 'text-white/70 hover:bg-white/8 hover:text-white'
            }`}
          >
            <span className="text-base leading-none flex items-center">
                {link.icon ?? link.emoji}
              </span>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Footer admin info + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <p className="font-quicksand text-xs text-white/50 truncate mb-3">{adminName}</p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full px-3 py-2 rounded-xl font-quicksand text-xs font-medium text-white/80 border border-white/20 hover:bg-white/10 transition-colors text-left"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar — fijo */}
      <aside
        className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 z-30"
        style={{ backgroundColor: 'var(--ian-dark)' }}
      >
        <NavContent />
      </aside>

      {/* Mobile topbar */}
      <div
        className="lg:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 h-14 border-b border-white/10"
        style={{ backgroundColor: 'var(--ian-dark)' }}
      >
        <p className="font-fredoka text-lg font-semibold text-white">Grupo IAN</p>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
          aria-label="Abrir menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          {/* Drawer */}
          <aside
            className="relative flex flex-col w-64 h-full z-50"
            style={{ backgroundColor: 'var(--ian-dark)' }}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white/60 hover:bg-white/10"
              aria-label="Cerrar menú"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}
