'use client';

import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 200, suffix: '+', label: 'Alumnos felices',       color: 'text-ian-red'    },
  { value: 10,  suffix: '+', label: 'Años de experiencia',   color: 'text-ian-orange' },
  { value: 3,   suffix: '',  label: 'Modalidades',           color: 'text-ian-green'  },
  { value: 100, suffix: '%', label: 'Bilingüe',              color: 'text-ian-blue'   },
];

function easeOutQuad(t: number) {
  return t * (2 - t);
}

function useCountUp(target: number, duration: number, triggered: boolean) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!triggered) return;

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(easeOutQuad(progress) * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [triggered, target, duration]);

  return count;
}

function StatItem({
  value,
  suffix,
  label,
  color,
  triggered,
}: {
  value: number;
  suffix: string;
  label: string;
  color: string;
  triggered: boolean;
}) {
  const count = useCountUp(value, 2000, triggered);

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      <span className={`text-5xl md:text-6xl font-bold ${color}`}>
        {count}{suffix}
      </span>
      <span className="text-white/70 text-sm md:text-base mt-1 text-center">
        {label}
      </span>
    </div>
  );
}

export default function StatsBar() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          setTriggered(true);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {/* Wave: blanco → oscuro */}
      <svg viewBox="0 0 1440 60" className="w-full -mb-1 block" aria-hidden="true">
        <path fill="#1A1A2E" d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
      </svg>

      <section
        ref={sectionRef}
        className="bg-ian-dark py-16 px-6"
        aria-label="Estadísticas Grupo IAN"
      >
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {stats.map((stat) => (
              <StatItem key={stat.label} {...stat} triggered={triggered} />
            ))}
          </div>
        </div>
      </section>

      {/* Wave: oscuro → blanco */}
      <svg viewBox="0 0 1440 60" className="w-full -mt-1 block" aria-hidden="true">
        <path fill="#ffffff" d="M0,30 C360,0 1080,60 1440,30 L1440,0 L0,0 Z" />
      </svg>
    </div>
  );
}
