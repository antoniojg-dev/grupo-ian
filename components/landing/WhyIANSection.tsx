'use client';

import { useEffect, useRef } from 'react';

const cards = [
  { emoji: '🕐', title: 'Horarios Flexibles',  color: 'bg-ian-blue/10',   iconBg: 'bg-ian-blue',   desc: 'Entrada desde las 7:00 AM. Adaptamos el horario a tu familia.'                              },
  { emoji: '🌎', title: 'Escuela Bilingüe',    color: 'bg-ian-red/10',    iconBg: 'bg-ian-red',    desc: 'Inglés integrado desde Kinder. Nuestros alumnos piensan en dos idiomas.'                   },
  { emoji: '📚', title: 'Regularización',      color: 'bg-ian-green/10',  iconBg: 'bg-ian-green',  desc: 'Reforzamos matemáticas, español, historia e inglés para que tu hijo brille.'               },
  { emoji: '🧠', title: 'Educación Integral',  color: 'bg-ian-purple/10', iconBg: 'bg-ian-purple', desc: 'Método High Scope + estimulación temprana + juego y aprendo.'                             },
  { emoji: '🛡️', title: 'Ambiente Seguro',    color: 'bg-ian-orange/10', iconBg: 'bg-ian-orange', desc: 'Instalaciones supervisadas y comunicación constante con los padres.'                       },
  { emoji: '🏊', title: 'Natación',            color: 'bg-ian-blue/10',   iconBg: 'bg-ian-blue',   desc: 'Acceso a la alberca de ACTIVE CLUB Universidad. Deporte y diversión.'                     },
];

const CARD_DELAYS = ['delay-100', 'delay-200', 'delay-300', 'delay-100', 'delay-200', 'delay-300'];

export default function WhyIANSection() {
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardRefs    = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const els = [titleRef.current, subtitleRef.current, ...cardRefs.current];

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
    <section id="nosotros" className="bg-white py-20 px-6">
      <div className="mx-auto max-w-5xl">

        {/* Título */}
        <h2
          ref={titleRef}
          className="section-hidden text-center text-3xl md:text-4xl font-bold text-ian-dark"
        >
          ¿Por qué las familias eligen{' '}
          <span className="text-ian-red">Grupo IAN</span>?
        </h2>

        {/* Subtítulo */}
        <p
          ref={subtitleRef}
          className="section-hidden delay-100 text-center text-gray-500 text-lg mt-3 max-w-xl mx-auto"
        >
          Porque aquí los niños no solo aprenden — se transforman.
        </p>

        {/* Grid de cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12">
          {cards.map((card, i) => (
            <div
              key={card.title}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`section-hidden ${CARD_DELAYS[i]} rounded-2xl p-6 shadow-sm ${card.color} hover:scale-[1.03] hover:shadow-lg transition-all duration-300 cursor-default`}
            >
              <div className={`w-12 h-12 ${card.iconBg} rounded-full flex items-center justify-center text-2xl mb-4`}>
                {card.emoji}
              </div>
              <h3 className="font-bold text-ian-dark text-lg mb-2">{card.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
