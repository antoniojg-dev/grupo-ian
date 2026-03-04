'use client';

import { useEffect, useRef } from 'react';

const cards = [
  { emoji: '🕐', title: 'Horarios Flexibles',    iconBg: 'bg-ian-blue',   shadowColor: 'rgba(0, 146, 225, 0.06)',  desc: 'Entrada desde las 7:00 AM. Adaptamos el horario a tu familia.'                              },
  { emoji: '🌎', title: 'Escuela Bilingüe',      iconBg: 'bg-ian-red',    shadowColor: 'rgba(224, 7, 0, 0.06)',    desc: 'Inglés integrado desde Kinder. Nuestros alumnos piensan en dos idiomas.'                   },
  { emoji: '📚', title: 'Regularización',        iconBg: 'bg-ian-green',  shadowColor: 'rgba(0, 180, 18, 0.06)',   desc: 'Reforzamos matemáticas, español, historia e inglés para que tu hijo brille.'               },
  { emoji: '🧠', title: 'Educación Integral',    iconBg: 'bg-ian-purple', shadowColor: 'rgba(131, 93, 255, 0.06)', desc: 'Método High Scope + estimulación temprana + juego y aprendo.'                             },
  { emoji: '🛡️', title: 'Ambiente Seguro',      iconBg: 'bg-ian-orange', shadowColor: 'rgba(255, 106, 27, 0.06)', desc: 'Instalaciones supervisadas y comunicación constante con los padres.'                       },
  { emoji: '🌱', title: 'Estimulación Temprana', iconBg: 'bg-ian-green',  shadowColor: 'rgba(0, 180, 18, 0.06)',   desc: 'Actividades diseñadas para potenciar el desarrollo cognitivo, motor y emocional desde los primeros años.' },
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
    <section id="nosotros" className="bg-[#FAFAF8] py-20 px-4">
      <div className="mx-auto max-w-5xl">

        {/* Título */}
        <h2
          ref={titleRef}
          className="section-hidden text-center text-3xl md:text-4xl font-fredoka font-bold text-ian-dark"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {cards.map((card, i) => (
            <div
              key={card.title}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`section-hidden ${CARD_DELAYS[i]} min-h-[180px] rounded-3xl p-6 bg-white transition-all duration-300 cursor-default`}
              style={{ boxShadow: `0 8px 24px ${card.shadowColor}` }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 24px 56px ${card.shadowColor.replace('0.06', '0.08')}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${card.shadowColor}`;
              }}
            >
              <div className={`w-14 h-14 ${card.iconBg} rounded-2xl flex items-center justify-center text-2xl mb-4`}>
                {card.emoji}
              </div>
              <h3 className="font-fredoka font-bold text-ian-dark text-lg mb-2">{card.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
