'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Testimonio = {
  texto: string;
  nombre: string;
  rol: string;
  iniciales: string;
  color: string;
  quoteColor: string;
};

const testimonios: Testimonio[] = [
  {
    texto:
      'Mi hijo llegó reprobando matemáticas y en 2 meses ya es de los mejores de su salón. Los maestros son increíbles y muy dedicados.',
    nombre: 'María González',
    rol: 'Mamá de Sebastián · 4° Primaria',
    iniciales: 'MG',
    color: 'bg-ian-red',
    quoteColor: 'text-ian-red',
  },
  {
    texto:
      'La flexibilidad de horarios es lo que más nos ha ayudado. Trabajo hasta tarde y siempre hay opción para que mi hija tome sus clases.',
    nombre: 'Roberto Hernández',
    rol: 'Papá de Sofía · Kinder',
    iniciales: 'RH',
    color: 'bg-ian-blue',
    quoteColor: 'text-ian-blue',
  },
  {
    texto:
      'Empezamos con el paquete Siembra y en 3 meses pasamos al Florece. El avance de mi hijo en inglés y natación ha sido impresionante.',
    nombre: 'Laura Martínez',
    rol: 'Mamá de Diego · 2° Primaria',
    iniciales: 'LM',
    color: 'bg-ian-green',
    quoteColor: 'text-ian-green',
  },
  {
    texto:
      'Lo que más me gusta es que combinan el deporte con el estudio. Mi hija viene feliz cada día y eso para mí lo dice todo.',
    nombre: 'Ana Pérez',
    rol: 'Mamá de Valentina · 1° Primaria',
    iniciales: 'AP',
    color: 'bg-ian-orange',
    quoteColor: 'text-ian-orange',
  },
  {
    texto:
      'El ambiente es muy seguro y los maestros siempre están en comunicación con nosotros. Se nota que les importa cada niño.',
    nombre: 'Carlos Ruiz',
    rol: 'Papá de Emilio · Kinder',
    iniciales: 'CR',
    color: 'bg-ian-purple',
    quoteColor: 'text-ian-purple',
  },
];

export default function TestimoniosSection() {
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const starsRef    = useRef<HTMLParagraphElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const n = testimonios.length;

  // Entry animations
  useEffect(() => {
    const els = [titleRef.current, starsRef.current, subtitleRef.current];
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('section-hidden');
          entry.target.classList.add('section-visible');
        }
      }),
      { threshold: 0.1 }
    );
    els.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const startAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setCurrent((i) => (i + 1) % n), 4000);
  }, [n]);

  useEffect(() => {
    startAutoplay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startAutoplay]);

  const go = (dir: 1 | -1) => {
    setCurrent((i) => (i + dir + n) % n);
    startAutoplay();
  };

  return (
    <section id="testimonios" className="bg-[#FAFAF8] py-20 px-6">
      <div className="mx-auto max-w-5xl">

        {/* Título */}
        <h2
          ref={titleRef}
          className="section-hidden text-center text-3xl md:text-4xl font-fredoka font-bold text-ian-dark"
        >
          Lo que dicen las familias de Grupo IAN
        </h2>

        {/* Estrellas */}
        <p ref={starsRef} className="section-hidden delay-100 text-ian-orange text-2xl text-center mt-3">
          ⭐⭐⭐⭐⭐
        </p>

        {/* Subtítulo */}
        <p ref={subtitleRef} className="section-hidden delay-100 text-gray-500 text-lg mt-2 text-center">
          Más de 200 familias ya confían en nosotros.
        </p>

        {/* Carousel */}
        <div className="mt-12 relative px-10 md:px-12">

          {/* Desktop: 3 cards */}
          <div className="hidden md:flex gap-6 items-stretch">
            {[-1, 0, 1].map((offset) => {
              const idx = (current + offset + n) % n;
              const isCenter = offset === 0;
              return (
                <div
                  key={offset}
                  className={`flex-1 transition-all duration-500 ${
                    isCenter ? 'scale-100 opacity-100' : 'scale-95 opacity-60'
                  }`}
                >
                  <TestimonioCard testimonio={testimonios[idx]} index={idx} />
                </div>
              );
            })}
          </div>

          {/* Mobile: 1 card */}
          <div className="md:hidden">
            <div key={current} className="animate-fade-in">
              <TestimonioCard testimonio={testimonios[current]} index={current} />
            </div>
          </div>

          {/* Arrow buttons */}
          <button
            onClick={() => go(-1)}
            aria-label="Anterior testimonio"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center text-ian-dark hover:bg-gray-50 transition-colors text-lg"
          >
            ←
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Siguiente testimonio"
            className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center text-ian-dark hover:bg-gray-50 transition-colors text-lg"
          >
            →
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonios.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); startAutoplay(); }}
              aria-label={`Testimonio ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2.5 bg-ian-red'
                  : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

function TestimonioCard({ testimonio: t, index }: { testimonio: Testimonio; index: number }) {
  const bgColor = index % 2 === 0 ? 'bg-[#FFFDE7]' : 'bg-[#E3F2FD]';
  return (
    <div className={`${bgColor} rounded-3xl p-6 flex flex-col gap-4 h-full`}>

      {/* Comillas grandes en color del avatar */}
      <div className={`text-6xl ${t.quoteColor} font-serif leading-none -mb-4 opacity-30 select-none`}>
        &ldquo;
      </div>

      {/* Texto */}
      <p className="text-gray-700 text-sm leading-relaxed italic flex-1">
        {t.texto}
      </p>

      {/* Avatar + info */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <div
          className={`w-12 h-12 ${t.color} text-white font-bold text-sm flex items-center justify-center rounded-full flex-shrink-0`}
        >
          {t.iniciales}
        </div>
        <div>
          <p className="font-bold text-ian-dark text-sm">{t.nombre}</p>
          <p className="text-gray-400 text-xs">{t.rol}</p>
          <p className="text-ian-orange text-xs mt-1">★★★★★</p>
        </div>
      </div>

    </div>
  );
}
