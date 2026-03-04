'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const TRUST_BADGES = [
  { text: '🎓 Maestros Certificados', bg: 'bg-blue-50',   color: 'text-blue-600'   },
  { text: '🛡️ Ambiente Seguro',       bg: 'bg-green-50',  color: 'text-green-600'  },
  { text: '🕐 Horarios Flexibles',    bg: 'bg-orange-50', color: 'text-orange-600' },
];

const WA_HREF =
  'https://wa.me/5255780724264?text=Hola%2C%20me%20interesa%20inscribir%20a%20mi%20hijo%20en%20Grupo%20IAN';

export default function HeroSection() {
  const badgeRef    = useRef<HTMLDivElement>(null);
  const h1Ref       = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const trustRef    = useRef<HTMLDivElement>(null);
  const ctasRef     = useRef<HTMLDivElement>(null);
  const imageRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [
      badgeRef.current,
      h1Ref.current,
      subtitleRef.current,
      trustRef.current,
      ctasRef.current,
      imageRef.current,
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('section-hidden');
            entry.target.classList.add('section-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    els.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-[#FAFAF8] pt-24 pb-8"
    >
      {/* ── Decorativos flotantes ──────────────────────────────── */}
      {/* Sol top-left */}
      <svg
        className="absolute top-10 left-4 opacity-30 pointer-events-none text-ian-yellow"
        width="48" height="48" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true"
      >
        <circle cx="24" cy="24" r="10" />
        <line x1="24" y1="2"  x2="24" y2="10"  stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="24" y1="38" x2="24" y2="46"  stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="2"  y1="24" x2="10" y2="24"  stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="38" y1="24" x2="46" y2="24"  stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="8"  y1="8"  x2="14" y2="14"  stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="34" y1="34" x2="40" y2="40"  stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="8"  x2="34" y2="14"  stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="14" y1="34" x2="8"  y2="40"  stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>

      {/* Nube top-right */}
      <svg
        className="absolute top-8 right-8 opacity-80 pointer-events-none text-white"
        width="80" height="48" viewBox="0 0 80 48" fill="currentColor" aria-hidden="true"
      >
        <ellipse cx="40" cy="36" rx="36" ry="14" />
        <ellipse cx="28" cy="30" rx="18" ry="16" />
        <ellipse cx="52" cy="28" rx="16" ry="14" />
      </svg>

      {/* Círculos decorativos */}
      <div className="absolute top-32 left-[15%] w-4 h-4 rounded-full bg-ian-red/10 pointer-events-none" />
      <div className="absolute top-48 left-[8%]  w-6 h-6 rounded-full bg-ian-blue/10 pointer-events-none" />
      <div className="absolute top-20 left-[30%] w-3 h-3 rounded-full bg-ian-green/10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* ── Columna texto ───────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Badge */}
            <div ref={badgeRef} className="section-hidden self-start">
              <span className="animate-pulse-soft inline-flex items-center gap-1.5 rounded-full border border-dashed border-green-200 bg-[#DCFCE7] px-4 py-1.5 text-sm font-medium text-green-700">
                🌟 ¡Inscripciones Abiertas 2025!
              </span>
            </div>

            {/* H1 multicolor */}
            <h1
              ref={h1Ref}
              className="section-hidden delay-100 text-4xl font-bold leading-tight tracking-tight text-ian-dark md:text-6xl"
            >
              Come{' '}
              <span className="relative inline-block">
                <span className="text-ian-red">aprende,</span>
                <svg
                  viewBox="0 0 100 8"
                  className="absolute -bottom-2 left-0 w-full"
                  aria-hidden="true"
                >
                  <path
                    d="M0,4 Q25,0 50,4 Q75,8 100,4"
                    stroke="#F5C518"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              <span className="text-ian-green">juega</span>{' '}
              <span className="text-ian-blue">y crece</span>{' '}
              con nosotros.
            </h1>

            {/* Subtítulo */}
            <p
              ref={subtitleRef}
              className="section-hidden delay-200 max-w-xl text-lg leading-relaxed text-gray-600"
            >
              Educación bilingüe de calidad para niños de Kinder y Primaria.
              Regularización, inglés, natación y mucho más — todo en un solo lugar.
            </p>

            {/* Trust badges */}
            <div ref={trustRef} className="section-hidden delay-300 flex flex-wrap gap-3">
              {TRUST_BADGES.map((badge) => (
                <span
                  key={badge.text}
                  className={`rounded-full ${badge.bg} ${badge.color} px-3 py-1 text-sm font-medium`}
                >
                  {badge.text}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div ref={ctasRef} className="section-hidden delay-400 flex flex-col gap-4">
              <div className="flex flex-wrap gap-4">
                <a
                  href={WA_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-ian-red px-6 py-3 font-quicksand font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-red-700"
                >
                  Inscribe a tu hijo →
                </a>
                <a
                  href="#paquetes"
                  className="inline-flex items-center rounded-full border-2 border-ian-blue px-6 py-3 font-quicksand font-semibold text-ian-blue transition-all duration-200 hover:bg-ian-blue hover:text-white"
                >
                  Ver paquetes
                </a>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 mt-4">
                <div className="flex">
                  {[
                    { initials: 'MG', bg: 'bg-ian-red'   },
                    { initials: 'RH', bg: 'bg-ian-blue'  },
                    { initials: 'AP', bg: 'bg-ian-green'  },
                  ].map((avatar, i) => (
                    <div
                      key={avatar.initials}
                      className={`w-8 h-8 rounded-full ${avatar.bg} text-white text-xs font-bold flex items-center justify-center border-2 border-[#FAFAF8] ${i > 0 ? '-ml-2' : ''}`}
                    >
                      {avatar.initials}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">+200 familias felices en Coyoacán</p>
              </div>
            </div>
          </div>

          {/* ── Columna imagen ──────────────────────────────────── */}
          <div ref={imageRef} className="section-hidden delay-200 relative flex justify-center">
            {/* Blob orgánico detrás — más visible */}
            <div
              className="absolute z-0"
              style={{
                width: '90%',
                height: '90%',
                top: '5%',
                left: '5%',
                background: '#FFF3B0',
                borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
              }}
            />

            {/* Imagen */}
            <div className="relative z-10 w-full">
              <Image
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"
                alt="Niños aprendiendo en Grupo IAN"
                width={800}
                height={600}
                className="h-auto w-full rounded-3xl object-cover shadow-xl"
                priority
              />

              {/* Mini badge flotante — natación */}
              <div className="absolute bottom-4 -left-4 z-20 bg-white rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-base shrink-0">
                  🏊
                </div>
                <div>
                  <span className="text-xs font-bold block text-ian-dark">INCLUYE</span>
                  <span className="text-xs text-gray-500">Clases de Natación</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
