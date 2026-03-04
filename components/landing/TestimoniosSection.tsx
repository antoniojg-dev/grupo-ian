'use client';

import { useEffect, useRef } from 'react';

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
  const gridRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [titleRef.current, starsRef.current, subtitleRef.current, gridRef.current];

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
    <section id="testimonios" className="bg-[#FAFAF8] py-20 px-6">
      <div className="mx-auto max-w-5xl">

        {/* Título */}
        <h2
          ref={titleRef}
          className="section-hidden text-center text-3xl md:text-4xl font-fredoka font-bold text-ian-dark"
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

        {/* Grid de burbujas */}
        <div
          ref={gridRef}
          className="section-hidden delay-200 mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonios.map((t, idx) => (
            <TestimonioCard key={t.nombre} testimonio={t} index={idx} />
          ))}
        </div>

      </div>
    </section>
  );
}

function TestimonioCard({ testimonio: t, index }: { testimonio: Testimonio; index: number }) {
  const bgColor = index % 2 === 0 ? 'bg-[#FFFDE7]' : 'bg-[#E3F2FD]';
  return (
    <div className={`${bgColor} rounded-3xl p-6 flex flex-col gap-4`}>

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
