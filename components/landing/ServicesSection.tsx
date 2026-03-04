'use client';

import { useState } from 'react';
import Image from 'next/image';

const TABS = ['Kinder & Primaria', 'Regularización', 'Inglés', 'Natación'];

const WA_INGLES =
  'https://wa.me/5255780724264?text=Hola%2C%20me%20interesa%20informaci%C3%B3n%20sobre%20las%20clases%20de%20ingl%C3%A9s%20en%20Grupo%20IAN';

type TabData = {
  headline: string;
  desc: string;
  checks: string[];
  price: string;
  priceLabel: string;
  ctaLabel: string;
  ctaHref: string;
  ctaTarget?: string;
  ctaColor: string;
  image: string;
  imageAlt: string;
};

const TAB_DATA: TabData[] = [
  {
    headline: 'Educación bilingüe completa desde los 3 años',
    desc: 'Nuestro programa incluye todo lo que tu hijo necesita para destacar. Método High Scope, estimulación temprana, matemáticas, español, historia, ciencias y mucho más.',
    checks: [
      'Clases de inglés integradas (no extracurricular)',
      'Estimulación temprana y juego educativo',
      'Método High Scope internacional',
      'Maestros certificados con experiencia',
      'Grupos pequeños, atención personalizada',
      'Modalidad virtual, presencial o mixta',
    ],
    price: 'Inscripción $4,000 · Colegiatura $5,000/mes',
    priceLabel: 'mensualidad escolar',
    ctaLabel: 'Inscribir ahora →',
    ctaHref: '#paquetes',
    ctaColor: 'bg-ian-red hover:bg-red-700',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
    imageAlt: 'Niños en clase de Kinder y Primaria',
  },
  {
    headline: 'Tu hijo puede mejorar sus calificaciones',
    desc: 'Clases de apoyo en inglés, español, matemáticas e historia. Maestros especializados que crean un plan personalizado para cada niño.',
    checks: [
      'Inglés conversacional y gramática',
      'Matemáticas con método lúdico',
      'Español y comprensión lectora',
      'Historia y ciencias sociales',
      'Preparación examen ingreso secundaria',
      'Grupos máximo 8 alumnos',
    ],
    price: 'Desde $1,250 MXN/mes',
    priceLabel: 'por alumno',
    ctaLabel: 'Ver paquetes →',
    ctaHref: '#paquetes',
    ctaColor: 'bg-ian-blue hover:bg-blue-600',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80',
    imageAlt: 'Alumno recibiendo clases de regularización',
  },
  {
    headline: 'Inglés para niños que aprenden jugando',
    desc: 'Clases extracurriculares diseñadas para niños de todas las edades. Profesores especializados y metodología comunicativa.',
    checks: [
      'Se divierte mientras aprende',
      'Profesores especializados en inglés infantil',
      'Clases personalizadas según nivel',
      'Materiales incluidos',
      'Horarios en tarde',
      'Precios accesibles',
    ],
    price: 'Desde $1,250 MXN/mes',
    priceLabel: 'clases extracurriculares',
    ctaLabel: 'Preguntar horarios →',
    ctaHref: WA_INGLES,
    ctaTarget: '_blank',
    ctaColor: 'bg-ian-blue hover:bg-blue-600',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
    imageAlt: 'Niños aprendiendo inglés jugando',
  },
  {
    headline: 'Nadar es disciplina, confianza y salud',
    desc: 'Acceso a la alberca de ACTIVE CLUB Universidad con instructores certificados. Incluido en nuestros paquetes Semillas de Sabiduría.',
    checks: [
      'Alberca profesional ACTIVE CLUB Universidad',
      'Instructores certificados',
      'Grupos por nivel y edad',
      'Niños desde 4 años',
      'Martes, Jueves y Viernes según paquete',
      'Incluido en paquetes desde $1,250/mes',
    ],
    price: 'Incluido en paquetes',
    priceLabel: 'Semillas de Sabiduría',
    ctaLabel: 'Ver paquetes →',
    ctaHref: '#paquetes',
    ctaColor: 'bg-ian-blue hover:bg-blue-600',
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80',
    imageAlt: 'Niños en clases de natación',
  },
];

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState(0);
  const tab = TAB_DATA[activeTab];

  return (
    <section id="servicios" className="bg-gray-50 py-20 px-6">
      <div className="mx-auto max-w-5xl">

        {/* Título */}
        <h2 className="text-center text-3xl md:text-4xl font-bold text-ian-dark">
          Todo lo que tu hijo necesita en{' '}
          <span className="text-ian-red">un solo lugar</span>
        </h2>

        {/* Subtítulo */}
        <p className="text-gray-500 text-lg mt-3 max-w-xl mx-auto text-center">
          Desde Kinder hasta Primaria, tenemos el programa perfecto para cada etapa.
        </p>

        {/* Tab switcher */}
        <div className="flex gap-2 mt-10 overflow-x-auto pb-2 justify-center">
          {TABS.map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveTab(i)}
              className={`whitespace-nowrap px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                activeTab === i
                  ? 'bg-ian-red text-white shadow-sm'
                  : 'text-gray-500 hover:text-ian-dark'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content — key forces remount for fade-in animation */}
        <div
          key={activeTab}
          className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center animate-fade-in"
        >
          {/* Left — texto */}
          <div className="flex flex-col gap-5">
            <h3 className="text-2xl font-bold text-ian-dark">{tab.headline}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{tab.desc}</p>

            <ul className="flex flex-col gap-3">
              {tab.checks.map((check) => (
                <li key={check} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ian-green/20 text-ian-green text-xs font-bold">
                    ✓
                  </span>
                  <span className="text-gray-600 text-sm">{check}</span>
                </li>
              ))}
            </ul>

            <a
              href={tab.ctaHref}
              target={tab.ctaTarget}
              rel={tab.ctaTarget === '_blank' ? 'noopener noreferrer' : undefined}
              className={`self-start inline-flex items-center rounded-full ${tab.ctaColor} px-6 py-3 font-semibold text-white text-sm transition-all duration-200 hover:scale-[1.02]`}
            >
              {tab.ctaLabel}
            </a>
          </div>

          {/* Right — imagen + precio flotante */}
          <div className="relative">
            <Image
              src={tab.image}
              alt={tab.imageAlt}
              width={600}
              height={420}
              className="w-full h-72 md:h-80 object-cover rounded-2xl shadow-lg"
            />
            <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg p-4 max-w-[190px]">
              <p className="text-ian-red font-bold text-xl leading-tight">{tab.price}</p>
              <p className="text-gray-500 text-sm mt-1">{tab.priceLabel}</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
