'use client';

import { useEffect, useRef } from 'react';

type Paquete = {
  accentColor: string;
  emoji: string;
  nombre: string;
  tagline: string;
  horas: string;
  includes: string[];
  nota: string;
  precio: string;
  popular: boolean;
};

const PAQUETES: Paquete[] = [
  {
    accentColor: '#E00700',
    emoji: '🌱',
    nombre: 'Siembra',
    tagline: 'El primer paso hacia el futuro',
    horas: '2 hrs / semana',
    includes: ['1 hr de Regularización', '1 hr de Natación'],
    nota: 'Perfecto para empezar.',
    precio: '$1,250',
    popular: false,
  },
  {
    accentColor: '#FF6A1B',
    emoji: '🧠',
    nombre: 'Crece',
    tagline: 'Más horas, más avance',
    horas: '5 hrs / semana',
    includes: ['3 hrs Regularización (L, M, J)', '2 hrs Natación (M, J)'],
    nota: 'El favorito de las familias.',
    precio: '$1,800',
    popular: true,
  },
  {
    accentColor: '#835DFF',
    emoji: '🌿',
    nombre: 'Florece',
    tagline: 'Máximo potencial',
    horas: '7 hrs / semana',
    includes: [
      '4 hrs Regularización (L, M, Mi, J)',
      '3 hrs Natación (M, J, V)',
    ],
    nota: 'Para niños que quieren destacar.',
    precio: '$2,500',
    popular: false,
  },
];

const CARD_DELAYS = ['delay-100', 'delay-200', 'delay-300'];

export default function PaquetesSection() {
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
    <section id="paquetes" className="bg-[#FAFAF8] py-20 px-6">
      <div className="mx-auto max-w-5xl">

        {/* Título */}
        <h2
          ref={titleRef}
          className="section-hidden text-center text-3xl md:text-4xl font-fredoka font-bold text-ian-dark"
        >
          Semillas de{' '}
          <span className="text-ian-orange">Sabiduría</span>
        </h2>

        {/* Subtítulo */}
        <p
          ref={subtitleRef}
          className="section-hidden delay-100 text-gray-500 text-lg mt-3 max-w-2xl mx-auto text-center"
        >
          Regularización académica + natación en un solo plan mensual.
          <br className="hidden sm:block" />
          Elige el que mejor se adapta al ritmo de tu hijo.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 items-start">
          {PAQUETES.map((p, i) => (
            <PaqueteCard
              key={p.nombre}
              paquete={p}
              delay={CARD_DELAYS[i]}
              ref={(el) => { cardRefs.current[i] = el; }}
            />
          ))}
        </div>

        {/* Nota inferior */}
        <p className="text-gray-400 text-sm mt-12 text-center">
          💡 Todos los paquetes incluyen acceso a la alberca de ACTIVE CLUB Universidad.
          <br className="hidden sm:block" />
          Recibes recibo PDF por cada pago. Precios en MXN. Ciclo mensual.
        </p>

      </div>
    </section>
  );
}

import { forwardRef } from 'react';

const PaqueteCard = forwardRef<
  HTMLDivElement,
  { paquete: Paquete; delay: string }
>(function PaqueteCard({ paquete: p, delay }, ref) {
  const waText = encodeURIComponent(
    `Hola, me interesa el paquete ${p.nombre} de Semillas de Sabiduría`
  );
  const waHref = `https://wa.me/5255780724264?text=${waText}`;

  return (
    <div
      ref={ref}
      className={`section-hidden ${delay} relative rounded-3xl p-8 bg-white border-2 transition-all duration-300 ${
        p.popular
          ? 'border-ian-orange md:scale-[1.02]'
          : 'border-gray-100'
      }`}
      style={
        p.popular
          ? { boxShadow: '0 20px 60px rgba(255, 106, 27, 0.25)' }
          : { boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }
      }
    >
      {/* Badge MÁS POPULAR */}
      {p.popular && (
        <span
          className="absolute top-4 right-4 bg-ian-orange text-white text-xs font-bold px-3 py-1 rounded-full"
        >
          MÁS POPULAR
        </span>
      )}

      {/* Emoji */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-4xl"
        style={{ backgroundColor: `${p.accentColor}26` }}
      >
        {p.emoji}
      </div>

      {/* Nombre */}
      <h3
        className="font-fredoka text-2xl font-bold mt-4"
        style={{ color: p.accentColor }}
      >
        {p.nombre}
      </h3>

      {/* Tagline */}
      <p className="text-gray-500 text-sm mt-1">{p.tagline}</p>

      {/* Horas */}
      <div
        className="inline-block rounded-xl px-4 py-2 mt-4 text-sm font-semibold"
        style={{ backgroundColor: `${p.accentColor}1A`, color: p.accentColor }}
      >
        {p.horas}
      </div>

      {/* Includes */}
      <ul className="mt-4 space-y-2">
        {p.includes.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="font-bold text-sm mt-0.5" style={{ color: p.accentColor }}>
              ✦
            </span>
            <span className="text-gray-600 text-sm">{item}</span>
          </li>
        ))}
      </ul>

      {/* Nota */}
      <p className="text-gray-400 text-xs italic mt-3">{p.nota}</p>

      {/* Precio */}
      <p className="font-fredoka text-5xl font-bold mt-6" style={{ color: p.accentColor }}>
        {p.precio}
        <span className="text-gray-400 text-lg font-normal"> /mes</span>
        <span className="text-sm text-gray-400 block font-normal">MXN</span>
      </p>

      {/* CTA */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full mt-6 py-3 rounded-2xl font-quicksand font-semibold text-sm text-center block transition-all duration-200 hover:scale-[1.02] ${
          p.popular
            ? 'text-white'
            : 'border-2 hover:text-white'
        }`}
        style={
          p.popular
            ? { backgroundColor: p.accentColor }
            : {
                borderColor: p.accentColor,
                color: p.accentColor,
              }
        }
        onMouseEnter={(e) => {
          if (!p.popular) {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = p.accentColor;
            (e.currentTarget as HTMLAnchorElement).style.color = '#ffffff';
          }
        }}
        onMouseLeave={(e) => {
          if (!p.popular) {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '';
            (e.currentTarget as HTMLAnchorElement).style.color = p.accentColor;
          }
        }}
      >
        ¡Inscribirse!
      </a>
    </div>
  );
});
