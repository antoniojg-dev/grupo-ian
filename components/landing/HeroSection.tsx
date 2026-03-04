'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const TRUST_BADGES = [
  '🎓 Maestros Certificados',
  '🛡️ Ambiente Seguro',
  '🕐 Horarios Flexibles',
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
      className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30 pt-24 pb-0"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* ── Columna texto ───────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Badge */}
            <div ref={badgeRef} className="section-hidden self-start">
              <span className="animate-pulse-soft inline-flex items-center gap-1.5 rounded-full border border-ian-orange/30 bg-ian-orange/10 px-4 py-1.5 text-sm font-medium text-ian-orange">
                ✨ ¡Inscripciones Abiertas 2025!
              </span>
            </div>

            {/* H1 multicolor */}
            <h1
              ref={h1Ref}
              className="section-hidden delay-100 text-4xl font-bold leading-tight text-ian-dark md:text-6xl"
            >
              Come{' '}
              <span className="text-ian-red">aprende,</span>{' '}
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
                  key={badge}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div ref={ctasRef} className="section-hidden delay-400 flex flex-wrap gap-4">
              <a
                href={WA_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-ian-red px-6 py-3 font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-red-700"
              >
                Inscribe a tu hijo →
              </a>
              <a
                href="#paquetes"
                className="inline-flex items-center rounded-full border-2 border-ian-blue px-6 py-3 font-semibold text-ian-blue transition-all duration-200 hover:bg-ian-blue hover:text-white"
              >
                Ver paquetes
              </a>
            </div>
          </div>

          {/* ── Columna imagen ──────────────────────────────────── */}
          <div ref={imageRef} className="section-hidden delay-200 relative flex justify-center">
            {/* Círculos decorativos */}
            <div className="absolute -right-8 -top-8 z-0 h-72 w-72 rounded-full bg-ian-blue/20" />
            <div className="absolute -bottom-8 -left-8 z-0 h-52 w-52 rounded-full bg-ian-red/20" />
            <div className="absolute left-4 top-4 z-0 h-24 w-24 rounded-full bg-ian-yellow/30" />

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
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
