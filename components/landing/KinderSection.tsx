'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import {
  GraduationCap,
  Globe,
  Brain,
  BookOpen,
  Sprout,
  Gamepad2,
  Users,
} from 'lucide-react';

const WA_HREF =
  'https://wa.me/5255780724264?text=Hola%2C%20me%20interesa%20inscribir%20a%20mi%20hijo%20en%20Grupo%20IAN';

const FEATURES = [
  { icon: <Globe size={18} />,    color: 'ian-blue',   text: 'Inglés integrado desde Kinder' },
  { icon: <Brain size={18} />,    color: 'ian-purple', text: 'Método High Scope Internacional' },
  { icon: <BookOpen size={18} />, color: 'ian-red',    text: 'Matemáticas, Español e Historia' },
  { icon: <Sprout size={18} />,   color: 'ian-green',  text: 'Estimulación Temprana' },
  { icon: <Gamepad2 size={18} />, color: 'ian-orange', text: 'Juego y Aprendo' },
  { icon: <Users size={18} />,    color: 'ian-blue',   text: 'Grupos pequeños y personalizados' },
];

const iconBg: Record<string, string> = {
  'ian-blue':   'bg-ian-blue/10 text-ian-blue',
  'ian-purple': 'bg-ian-purple/10 text-ian-purple',
  'ian-red':    'bg-ian-red/10 text-ian-red',
  'ian-green':  'bg-ian-green/10 text-ian-green',
  'ian-orange': 'bg-ian-orange/10 text-ian-orange',
  'ian-dark':   'bg-ian-dark/10 text-ian-dark',
};

export default function KinderSection() {
  const imageRef     = useRef<HTMLDivElement>(null);
  const badgeRef     = useRef<HTMLDivElement>(null);
  const titleRef     = useRef<HTMLHeadingElement>(null);
  const listRef      = useRef<HTMLUListElement>(null);
  const priceRef     = useRef<HTMLDivElement>(null);
  const ctaRef       = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refs = [
      { el: imageRef.current,  delay: 0   },
      { el: badgeRef.current,  delay: 100 },
      { el: titleRef.current,  delay: 200 },
      { el: listRef.current,   delay: 300 },
      { el: priceRef.current,  delay: 400 },
      { el: ctaRef.current,    delay: 500 },
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

    refs.forEach(({ el, delay }) => {
      if (el) {
        (el as HTMLElement).style.transitionDelay = `${delay}ms`;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="kinder" className="bg-white py-20 px-6">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        {/* ── Columna IZQUIERDA — Imagen ───────────────────────── */}
        <div ref={imageRef} className="section-hidden relative flex justify-center">
          {/* Blob */}
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
              src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600"
              alt="Niños en Kinder Grupo IAN"
              width={600}
              height={450}
              className="w-full h-auto rounded-3xl shadow-lg object-cover"
            />

            {/* Badge flotante */}
            <div className="absolute bottom-4 left-4 z-20 bg-white rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2">
              <div className="w-9 h-9 bg-ian-blue/10 rounded-full flex items-center justify-center shrink-0">
                <GraduationCap size={18} className="text-ian-blue" />
              </div>
              <div>
                <span className="text-xs font-bold block text-ian-dark">NIVELES</span>
                <span className="text-xs text-gray-400">Kinder · Primaria</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Columna DERECHA — Contenido ──────────────────────── */}
        <div className="flex flex-col">

          {/* Badge */}
          <div ref={badgeRef} className="section-hidden delay-100">
            <span className="inline-flex bg-ian-blue/10 text-ian-blue rounded-full px-4 py-1 text-sm font-semibold mb-4">
              🎓 Kinder &amp; Primaria Bilingüe
            </span>
          </div>

          {/* Título */}
          <h2
            ref={titleRef}
            className="section-hidden delay-200 font-fredoka text-3xl md:text-4xl text-ian-dark leading-tight"
          >
            La mejor educación para los<br />
            primeros años de tu hijo
          </h2>

          {/* Descripción */}
          <p className="font-quicksand text-gray-500 text-base mt-3">
            Programa bilingüe completo diseñado para despertar la curiosidad, el amor por aprender y el desarrollo integral de cada niño desde los 3 años.
          </p>

          {/* Lista */}
          <ul ref={listRef} className="section-hidden delay-300 mt-6 space-y-3">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg[f.color]}`}
                >
                  {f.icon}
                </div>
                <span className="font-quicksand text-gray-700 text-sm font-medium">{f.text}</span>
              </li>
            ))}
          </ul>

          {/* Card de precio */}
          <div
            ref={priceRef}
            className="section-hidden delay-400 mt-8 bg-[#FFFDE7] border-2 border-dashed border-[#F5C518]/40 rounded-2xl p-5"
          >
            <p className="font-fredoka font-bold text-ian-orange text-lg">
              Inscripción: $4,000 MXN
            </p>
            <p className="font-fredoka font-bold text-ian-red text-xl">
              Colegiatura mensual: $5,000 MXN
            </p>
            <p className="font-quicksand text-xs text-gray-400 mt-2">
              * Becas disponibles. Inscripción condonable con cupón.
            </p>
          </div>

          {/* CTA */}
          <div ref={ctaRef} className="section-hidden delay-500 mt-6">
            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-ian-red text-white font-quicksand font-semibold rounded-full px-6 py-3 transition-all duration-200 hover:bg-red-700 hover:scale-[1.02]"
            >
              Inscribir a mi hijo →
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
