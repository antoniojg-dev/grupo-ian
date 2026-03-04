'use client';

import { useEffect, useRef } from 'react';

const WA_URL =
  'https://wa.me/5255780724264?text=Hola%2C%20me%20interesa%20inscribir%20a%20mi%20hijo%20en%20Grupo%20IAN';

export default function CTAFinalSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef  = useRef<HTMLParagraphElement>(null);
  const buttonsRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [headlineRef.current, subtextRef.current, buttonsRef.current];

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
    <section className="py-8 mb-8">
      <div className="mx-4 md:mx-12 bg-gradient-to-br from-ian-red to-ian-orange rounded-[48px] overflow-hidden py-20 px-6 text-center relative">

        {/* Elemento decorativo — sol/estrella SVG */}
        <svg
          className="absolute top-6 left-6 opacity-20 text-white pointer-events-none"
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M60 0 L63 45 L90 10 L72 50 L120 45 L80 60 L120 75 L72 70 L90 110 L63 75 L60 120 L57 75 L30 110 L48 70 L0 75 L40 60 L0 45 L48 50 L30 10 L57 45 Z" />
        </svg>

        {/* Círculos decorativos */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/10 rounded-full pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto">

          <h2
            ref={headlineRef}
            className="section-hidden text-4xl md:text-5xl font-fredoka font-bold tracking-tight text-white leading-tight"
          >
            ¡Adelántate al Futuro —<br />
            Asegura el lugar de tu hijo Desde Hoy!
          </h2>

          <p
            ref={subtextRef}
            className="section-hidden delay-100 text-white/80 text-lg mt-4 max-w-xl mx-auto"
          >
            Los lugares son limitados. No dejes pasar más tiempo.<br />
            El mejor momento para invertir en la educación de tu hijo es ahora.
          </p>

          <div
            ref={buttonsRef}
            className="section-hidden delay-200 flex gap-4 justify-center mt-10 flex-wrap"
          >
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-ian-red font-quicksand font-bold rounded-full px-8 py-4 transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02]"
            >
              🚀 Inscribir a mi hijo ahora
            </a>

            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white font-quicksand font-bold rounded-full px-8 py-4 transition-all duration-200 hover:bg-white hover:text-ian-red"
            >
              💬 Hablar por WhatsApp
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
