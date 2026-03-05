'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CreditCard, LogOut, Menu, X } from 'lucide-react'
import { logoutPadreAction } from '@/app/dashboard/padre/actions'

const NAV_LINKS = [
  { href: '/dashboard/padre', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/padre/pagos', label: 'Mis Pagos', icon: CreditCard },
]

export default function NavbarPadre({ padreName }: { padreName: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard/padre" className="font-fredoka text-xl font-semibold" style={{ color: 'var(--ian-dark)' }}>
            Grupo IAN
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-quicksand text-sm font-medium transition-colors ${
                  isActive(href, exact)
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
                style={isActive(href, exact) ? { backgroundColor: 'var(--ian-blue)' } : {}}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right: name + logout */}
          <div className="hidden md:flex items-center gap-3">
            <span className="font-quicksand text-sm text-gray-600 max-w-[160px] truncate">{padreName}</span>
            <form action={logoutPadreAction}>
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-2 rounded-xl font-quicksand text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </button>
            </form>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative bg-white w-72 h-full flex flex-col shadow-xl z-50">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-fredoka text-lg font-semibold" style={{ color: 'var(--ian-dark)' }}>
                Grupo IAN
              </span>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                aria-label="Cerrar menú"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-quicksand text-sm font-medium transition-colors ${
                    isActive(href, exact)
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={isActive(href, exact) ? { backgroundColor: 'var(--ian-blue)' } : {}}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="px-4 py-4 border-t border-gray-100">
              <p className="font-quicksand text-xs text-gray-400 truncate mb-3">{padreName}</p>
              <form action={logoutPadreAction}>
                <button
                  type="submit"
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl font-quicksand text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
