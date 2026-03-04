'use client';

import { useEffect, useRef, useState } from 'react';

type Testimonio = {
  texto: string;
  nombre: string;
  rol: string;
  iniciales: string;
  color: string;
};

const testimonios: Testimonio[] = [
  {
    texto:
      'Mi hijo llegó reprobando matemáticas y en 2 meses ya es de los mejores de su salón. Los maestros son increíbles y muy dedicados.',
    nombre: 'María González',
    rol: 'Mamá de Sebastián · 4° Primaria',
    iniciales: 'MG',
    color: 'bg-ian-red',
  },
  {
    texto:
      'La flexibilidad de horarios es lo que más nos ha ayudado. Trabajo hasta tarde y siempre hay opción para que mi hija tome sus clases.',
    nombre: 'Roberto Hernández',
    rol: 'Papá de Sofía · Kinder',
    iniciales: 'RH',
    color: 'bg-ian-blue',
  },
  {
    texto:
      'Empezamos con el paquete Siembra y en 3 meses pasamos al Florece. El avance de mi hijo en inglés y natación ha sido impresionante.',
    nombre: 'Laura Martínez',
    rol: 'Mamá de Diego · 2° Primaria',
    iniciales: 'LM',
    color: 'bg-ian-green',
  },
  {
    texto:
      'Lo que más me gusta es que combinan el deporte con el estudio. Mi hija viene feliz cada día y eso para mí lo dice todo.',
    nombre: 'Ana Pérez',
    rol: 'Mamá de Valentina · 1° Primaria',
    iniciales: 'AP',
    color: 'bg-ian-orange',
  },
  {
    texto:
      'El ambiente es muy seguro y los maestros siempre están en comunicación con nosotros. Se nota que les importa cada niño.',
    nombre: 'Carlos Ruiz',
    rol: 'Papá de Emilio · Kinder',
    iniciales: 'CR',
    color: 'bg-ian-purple',
  },
];

const total = testimonios.length;

export default function TestimoniosSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const titleRef    = useRef<HTMLHeadingElement>(null);
  const starsRef    = useRef<HTMLParagraphElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Entry animations via IntersectionObserver
  useEffect(() => {
    const els = [titleRef.current, starsRef.current, subtitleRef.current, carouselRef.current];

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

  // Auto-play every 4 s, pauses on hover
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % total);
    }, 4000);
    return () => clearInterval(id);
  }, [paused]);

  const prev = () => setActiveIndex((i) => (i - 1 + total) % total);
  const next = () => setActiveIndex((i) => (i + 1) % total);

  const prevIndex = (activeIndex - 1 + total) % total;
  const nextIndex = (activeIndex + 1) % total;

  return (
    <section id="testimonios" className="bg-gray-50 py-20 px-6">
      <div className="mx-auto max-w-5xl">

        {/* Título */}
        <h2
          ref={titleRef}
          className="section-hidden text-center text-3xl md:text-4xl font-bold text-ian-dark"
        >
          Lo que dicen las familias de Grupo IAN
        </h2>

        {/* Estrellas decorativas */}
        <p
          ref={starsRef}
          className="section-hidden delay-100 text-ian-orange text-2xl text-center mt-3"
        >
          ⭐⭐⭐⭐⭐
        </p>

        {/* Subtítulo */}
        <p
          ref={subtitleRef}
          className="section-hidden delay-100 text-gray-500 text-lg mt-2 text-center"
        >
          Más de 200 familias ya confían en nosotros.
        </p>

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="section-hidden delay-200 mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Track */}
          <div className="flex items-center gap-4">

            {/* ← */}
            <button
              onClick={prev}
              aria-label="Testimonio anterior"
              className="flex-shrink-0 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center text-ian-dark transition-colors hover:bg-ian-red hover:text-white"
            >
              ←
            </button>

            {/* Cards */}
            <div className="flex-1 min-w-0">

              {/* Mobile: solo la card activa */}
              <div className="block md:hidden">
                <TestimonioCard testimonio={testimonios[activeIndex]} />
              </div>

              {/* Desktop: prev · active · next */}
              <div className="hidden md:flex gap-6 items-stretch">
                <div className="flex-1 transition-all duration-500 scale-95 opacity-60">
                  <TestimonioCard testimonio={testimonios[prevIndex]} />
                </div>
                <div className="flex-1 transition-all duration-500 scale-100 opacity-100">
                  <TestimonioCard testimonio={testimonios[activeIndex]} />
                </div>
                <div className="flex-1 transition-all duration-500 scale-95 opacity-60">
                  <TestimonioCard testimonio={testimonios[nextIndex]} />
                </div>
              </div>
            </div>

            {/* → */}
            <button
              onClick={next}
              aria-label="Testimonio siguiente"
              className="flex-shrink-0 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center text-ian-dark transition-colors hover:bg-ian-red hover:text-white"
            >
              →
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center items-center gap-2 mt-8">
            {testimonios.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Ir al testimonio ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'bg-ian-red w-6 h-2'
                    : 'bg-gray-300 w-2 h-2'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

function TestimonioCard({ testimonio: t }: { testimonio: Testimonio }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm h-full">

      {/* Comillas decorativas */}
      <div className="text-6xl text-ian-red/20 font-serif leading-none -mb-4 select-none">
        &ldquo;
      </div>

      {/* Texto */}
      <p className="text-gray-600 text-sm leading-relaxed italic">
        {t.texto}
      </p>

      {/* Separador */}
      <hr className="border-gray-100 my-4" />

      {/* Avatar + info */}
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 ${t.color} text-white font-bold text-sm flex items-center justify-center rounded-full flex-shrink-0`}
        >
          {t.iniciales}
        </div>
        <div>
          <p className="font-semibold text-ian-dark text-sm">{t.nombre}</p>
          <p className="text-gray-400 text-xs">{t.rol}</p>
          <p className="text-ian-orange text-xs mt-1">★★★★★</p>
        </div>
      </div>

    </div>
  );
}
