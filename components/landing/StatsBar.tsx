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
      <span className="text-white/80 text-sm md:text-base mt-1 text-center">
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
    <section
      ref={sectionRef}
      className="bg-ian-dark py-20 px-6 text-white"
      style={{ clipPath: 'polygon(0 4%, 100% 0%, 100% 96%, 0% 100%)' }}
      aria-label="Estadísticas Grupo IAN"
    >
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 text-white">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} triggered={triggered} />
          ))}
        </div>
      </div>
    </section>
  );
}
