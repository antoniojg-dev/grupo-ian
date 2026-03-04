'use client';

import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { label: 'Inicio',     href: '#inicio' },
  { label: 'Nosotros',   href: '#nosotros' },
  { label: 'Servicios',  href: '#servicios' },
  { label: 'Paquetes',   href: '#paquetes' },
  { label: 'Galería',    href: '#galeria' },
  { label: 'Contacto',   href: '#contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLinkClick = (href: string) => {
    setMenuOpen(false);
    // Pequeño delay para que el drawer cierre antes del scroll
    setTimeout(() => {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 border-b border-gray-100 ${
          scrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">

          {/* Logo */}
          <a
            href="#inicio"
            onClick={(e) => { e.preventDefault(); handleLinkClick('#inicio'); }}
            className="flex flex-col leading-none"
          >
            <span className="flex items-center gap-1.5 font-poppins text-xl font-bold text-ian-dark">
              <span className="text-2xl">🧠</span>
              <span>
                GRUPO{' '}
                <span className="text-ian-red">IAN</span>
              </span>
            </span>
            <span className="pl-9 text-xs font-medium text-gray-400 tracking-wide">
              El Futuro Es Hoy
            </span>
          </a>

          {/* Links desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleLinkClick(link.href); }}
                className="relative text-sm font-medium text-ian-dark transition-colors hover:text-ian-red
                  after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-ian-red
                  after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Derecha: botón portal + hamburger */}
          <div className="flex items-center gap-3">
            <a
              href="#contacto"
              onClick={(e) => { e.preventDefault(); handleLinkClick('#contacto'); }}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-ian-red px-5 py-2
                text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Portal Padres →
            </a>

            {/* Hamburger */}
            <button
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
            >
              <span
                className={`block h-0.5 w-6 bg-ian-dark transition-all duration-300 ${
                  menuOpen ? 'translate-y-2 rotate-45' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-ian-dark transition-all duration-300 ${
                  menuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-ian-dark transition-all duration-300 ${
                  menuOpen ? '-translate-y-2 -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile drawer — baja desde arriba */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col border-t border-gray-100 bg-white px-4 pb-6 pt-2">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleLinkClick(link.href); }}
                className="border-b border-gray-50 py-3.5 text-base font-medium text-ian-dark
                  transition-colors hover:text-ian-red"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contacto"
              onClick={(e) => { e.preventDefault(); handleLinkClick('#contacto'); }}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full
                bg-ian-red px-5 py-3 text-sm font-semibold text-white"
            >
              Portal Padres →
            </a>
          </nav>
        </div>
      </header>

      {/* Overlay para cerrar el drawer al tocar fuera */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
