'use client';

import { useState, useEffect, useRef } from 'react';

const faqs = [
  {
    q: '¿Qué incluye la colegiatura mensual?',
    a: 'La colegiatura de $5,000 MXN/mes incluye todas las clases del programa bilingüe: inglés integrado, matemáticas, español, historia, estimulación temprana, método High Scope y actividades de juego y aprendo. Es un programa completo.',
  },
  {
    q: '¿Cuál es la diferencia entre la colegiatura y los paquetes Semillas de Sabiduría?',
    a: 'La colegiatura es el programa escolar regular (Kinder/Primaria). Los paquetes Semillas de Sabiduría son servicios extracurriculares de regularización + natación, ideales para niños que ya van a otra escuela.',
  },
  {
    q: '¿Tienen modalidad virtual?',
    a: 'Sí. Ofrecemos modalidad virtual, presencial y mixta. Puedes elegir la que mejor se adapte a tu situación y cambiarla según tus necesidades.',
  },
  {
    q: '¿Hay becas disponibles?',
    a: 'Sí contamos con programa de becas. Para más información sobre requisitos y disponibilidad, contáctanos por WhatsApp al 55 7807 2426.',
  },
  {
    q: '¿A partir de qué edad pueden inscribirse?',
    a: 'Desde los 3 años en nuestro programa de Kinder. Para regularización y paquetes Semillas de Sabiduría, recibimos niños de todas las edades de primaria.',
  },
  {
    q: '¿Cómo es el proceso de inscripción?',
    a: 'Muy sencillo: 1) Contáctanos por WhatsApp, 2) Agendamos una visita, 3) Llenamos el formulario, 4) Realizas el pago de inscripción. ¡Listo, tu hijo ya es parte de Grupo IAN!',
  },
  {
    q: '¿Cómo pago en línea?',
    a: 'Próximamente tendremos nuestro portal de pagos donde podrás pagar con tarjeta y recibir tu recibo PDF automáticamente. Por ahora: efectivo, transferencia o tarjeta directamente.',
  },
  {
    q: '¿Qué pasa si mi hijo falta a natación?',
    a: 'Entendemos que los niños a veces se enferman. Coordinamos clases de recuperación según disponibilidad. Habla con nosotros y buscamos la mejor solución.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const titleRef    = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const itemRefs    = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const els = [titleRef.current, subtitleRef.current, ...itemRefs.current];

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

  function toggle(i: number) {
    setOpenIndex((prev) => (prev === i ? null : i));
  }

  return (
    <section id="faq" className="bg-white rounded-[40px] mx-4 my-8 py-16 px-6">
      <div className="mx-auto max-w-3xl">

        {/* Título */}
        <h2
          ref={titleRef}
          className="section-hidden text-center text-3xl md:text-4xl font-fredoka font-bold text-ian-dark"
        >
          Preguntas frecuentes
        </h2>

        {/* Subtítulo */}
        <p
          ref={subtitleRef}
          className="section-hidden delay-100 text-gray-500 text-lg mt-3 max-w-xl mx-auto text-center"
        >
          ¿Tienes dudas? Aquí respondemos las más comunes.
          <br className="hidden sm:block" />
          Si no encuentras lo que buscas, escríbenos por WhatsApp.
        </p>

        {/* Acordeón */}
        <div className="mt-12">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                ref={(el) => { itemRefs.current[i] = el; }}
                className={`section-hidden border-b border-gray-100 py-2 transition-colors duration-200`}
                style={{ animationDelay: `${(i + 1) * 100}ms` }}
              >
                {/* Header */}
                <button
                  onClick={() => toggle(i)}
                  className={`w-full flex justify-between items-center text-left px-4 py-3 rounded-2xl transition-colors duration-200 ${
                    isOpen ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-ian-dark text-base pr-4">
                    {faq.q}
                  </span>
                  <span className="text-ian-red text-2xl font-bold shrink-0 transition-transform duration-300">
                    {isOpen ? '×' : '→'}
                  </span>
                </button>

                {/* Respuesta */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <p className="text-gray-500 text-sm leading-relaxed pt-2 pb-4 px-4">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
