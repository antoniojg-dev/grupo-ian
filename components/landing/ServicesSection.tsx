'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BookOpen, Globe, Waves, CheckCircle2 } from 'lucide-react';
import ContactModal from './ContactModal';

const TABS = [
  { icon: <BookOpen      className="w-4 h-4 shrink-0" />, label: 'Regularización', short: 'Regularización'    },
  { icon: <Globe         className="w-4 h-4 shrink-0" />, label: 'Inglés',         short: 'Inglés'            },
  { icon: <Waves         className="w-4 h-4 shrink-0" />, label: 'Natación',       short: 'Natación'          },
];

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
    ctaHref: '#',
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
  const [contactOpen, setContactOpen] = useState(false);
  const tab = TAB_DATA[activeTab];
  const isWhatsAppCta = tab.ctaTarget === '_blank';

  return (
    <section id="servicios" className="bg-white rounded-[40px] mx-4 my-8 py-16 px-4">
      <div className="mx-auto max-w-5xl">

        {/* Título */}
        <h2 className="text-center text-3xl md:text-4xl font-fredoka font-bold text-ian-dark">
          Todo lo que tu hijo necesita en{' '}
          <span className="text-ian-red">un solo lugar</span>
        </h2>

        {/* Subtítulo */}
        <p className="text-gray-500 text-lg mt-3 max-w-xl mx-auto text-center">
          Desde Kinder hasta Primaria, tenemos el programa perfecto para cada etapa.
        </p>

        {/* Tab switcher — pills con emoji */}
        <div className="grid grid-cols-2 gap-2 mt-10 md:flex md:gap-2 md:justify-center">
          {TABS.map((tab, i) => (
            <button
              key={tab.short}
              onClick={() => setActiveTab(i)}
              className={`inline-flex items-center justify-center gap-2 text-sm text-center py-2.5 px-4 rounded-full font-medium transition-all duration-200 md:whitespace-nowrap ${
                activeTab === i
                  ? 'bg-ian-red text-white shadow-lg shadow-red-200'
                  : 'bg-gray-100 text-gray-600 hover:text-ian-dark'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          key={activeTab}
          className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center animate-fade-in"
        >
          {/* Left — texto */}
          <div className="flex flex-col gap-5">
            <h3 className="text-2xl font-fredoka font-bold text-ian-dark">{tab.headline}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{tab.desc}</p>

            <ul className="flex flex-col gap-3">
              {tab.checks.map((check) => (
                <li key={check} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0 text-ian-green" />
                  <span className="text-gray-600 text-sm">{check}</span>
                </li>
              ))}
            </ul>

            {isWhatsAppCta ? (
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className={`self-start inline-flex items-center rounded-full ${tab.ctaColor} px-6 py-3 font-quicksand font-semibold text-white text-sm transition-all duration-200 hover:scale-[1.02]`}
              >
                {tab.ctaLabel}
              </button>
            ) : (
              <a
                href={tab.ctaHref}
                className={`self-start inline-flex items-center rounded-full ${tab.ctaColor} px-6 py-3 font-quicksand font-semibold text-white text-sm transition-all duration-200 hover:scale-[1.02]`}
              >
                {tab.ctaLabel}
              </a>
            )}
          </div>

          {/* Right — imagen + precio flotante */}
          <div className="relative hidden md:block">
            <Image
              src={tab.image}
              alt={tab.imageAlt}
              width={600}
              height={420}
              className="w-full h-72 md:h-80 object-cover rounded-2xl shadow-lg"
            />
            <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg p-4 max-w-[190px]">
              <p className="font-fredoka text-ian-red font-bold text-xl leading-tight">{tab.price}</p>
              <p className="text-gray-500 text-sm mt-1">{tab.priceLabel}</p>
            </div>
          </div>
        </div>

      </div>

      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        tipo="kinder"
        interesInicial="Kinder 1"
      />
    </section>
  );
}
