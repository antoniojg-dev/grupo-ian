'use client';

const WA_URL =
  'https://wa.me/5255780724264?text=Hola%2C%20me%20interesa%20inscribir%20a%20mi%20hijo%20en%20Grupo%20IAN';

const navLinks = [
  { label: 'Inicio',    href: '#hero' },
  { label: 'Nosotros',  href: '#nosotros' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Paquetes',  href: '#paquetes' },
  { label: 'Galería',   href: '#galeria' },
  { label: 'Contacto',  href: '#contacto' },
];

const servicios = [
  'Kinder Bilingüe',
  'Primaria Bilingüe',
  'Regularización',
  'Clases de Inglés',
  'Natación',
];

function scrollTo(href: string) {
  const id = href.replace('#', '');
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function Footer() {
  return (
    <footer className="bg-ian-dark text-white pt-16 pb-8 px-6">
      <div className="mx-auto max-w-6xl">

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* COL 1 — Marca */}
          <div>
            <p className="font-bold text-xl">
              🧠 GRUPO <span className="text-ian-red">IAN</span>
            </p>
            <p className="text-white/50 text-sm mt-1">El Futuro Es Hoy</p>
            <p className="text-white/60 text-sm mt-3 leading-relaxed">
              Formando los líderes del mañana con educación bilingüe, deporte y
              valores desde Coyoacán, CDMX.
            </p>

            {/* Redes */}
            <div className="mt-4 flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 bg-white/10 hover:bg-ian-red rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200"
              >
                f
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 bg-white/10 hover:bg-ian-red rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200"
              >
                ig
              </a>
            </div>
          </div>

          {/* COL 2 — Navegación */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
              Navegación
            </p>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-white/70 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 3 — Servicios */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
              Servicios
            </p>
            <ul className="space-y-2">
              {servicios.map((s) => (
                <li key={s} className="text-white/70 text-sm">
                  {s}
                </li>
              ))}
              <li>
                <a
                  href="/login"
                  className="text-ian-orange text-sm hover:brightness-110 transition-all duration-200"
                >
                  Portal de Padres →
                </a>
              </li>
            </ul>
          </div>

          {/* COL 4 — Contacto */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
              Contacto
            </p>
            <ul className="space-y-3">
              <li className="flex gap-2 text-white/70 text-sm">
                <span>📍</span>
                <span>
                  Cerro Acasulco #42, Oxtopulco Universidad, Coyoacán, CDMX
                </span>
              </li>
              <li className="flex gap-2 text-white/70 text-sm">
                <span>📱</span>
                <span>55 7807 2426</span>
              </li>
              <li className="flex gap-2 text-white/70 text-sm">
                <span>🕐</span>
                <span>7:00 – 19:00 hrs</span>
              </li>
            </ul>

            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-[#25D366] text-white rounded-full px-4 py-2 text-sm font-semibold hover:brightness-110 transition-all duration-200"
            >
              💬 Escríbenos por WhatsApp
            </a>
          </div>

        </div>

        {/* Separador */}
        <div className="border-t border-white/10 mt-12 pt-8 flex justify-between flex-wrap gap-2 text-white/40 text-xs">
          <span>© 2025 Grupo IAN. Todos los derechos reservados.</span>
          <button className="hover:text-white/70 transition-colors duration-200 cursor-pointer">
            Aviso de Privacidad
          </button>
        </div>

      </div>
    </footer>
  );
}
