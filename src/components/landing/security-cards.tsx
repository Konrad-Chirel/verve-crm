'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Database, KeyRound, Lock, LogOut, RotateCcw } from 'lucide-react';

const PILLARS = [
  {
    icon: Database,
    title: 'Isolation par compte (RLS)',
    text: 'Chaque mandat, société et relance est verrouillé par une politique Row Level Security liée à votre identifiant.',
    orbColor: '#10B981',
    originOffset: 'translate(28px, 22px) scale(0.72)',
  },
  {
    icon: KeyRound,
    title: 'Auth chiffrée & PKCE',
    text: 'Connexion e-mail ou Google via Supabase SSR, avec middleware Edge default-deny sur chaque route privée.',
    orbColor: '#34D399',
    originOffset: 'translate(-28px, 22px) scale(0.72)',
  },
  {
    icon: Lock,
    title: 'En-têtes HTTP renforcés',
    text: 'Content-Security-Policy, HSTS preload, X-Frame-Options DENY et protection anti-Open Redirect actifs.',
    orbColor: '#059669',
    originOffset: 'translate(28px, -22px) scale(0.72)',
  },
  {
    icon: LogOut,
    title: 'Zéro trace à la sortie',
    text: 'Dès la déconnexion, le cache local et les cookies de session sont purgés pour sécuriser les postes partagés.',
    orbColor: '#6EE7B7',
    originOffset: 'translate(-28px, -22px) scale(0.72)',
  },
];

type Phase = 'idle' | 'orbs-in' | 'converge' | 'reveal';

export function SecurityCards() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const hasPlayedRef = useRef(false);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const playSequence = useCallback(() => {
    clearTimers();
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setPhase('reveal');
      return;
    }

    setPhase('orbs-in');
    timersRef.current.push(setTimeout(() => setPhase('converge'), 950));
    timersRef.current.push(setTimeout(() => setPhase('reveal'), 1550));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasPlayedRef.current) {
          hasPlayedRef.current = true;
          playSequence();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimers();
    };
  }, [playSequence]);

  const showOrbs = phase === 'orbs-in' || phase === 'converge';
  const showCards = phase === 'reveal';

  // Windows 7-style 4 orbiting orbs spiraling smoothly into the center before blossoming into the 4 cards
  const orbPositions = [
    phase === 'orbs-in'
      ? 'translate(-72px, -54px) scale(1)'
      : 'translate(0px, 0px) scale(0.55)',
    phase === 'orbs-in'
      ? 'translate(72px, -54px) scale(1)'
      : 'translate(0px, 0px) scale(0.55)',
    phase === 'orbs-in'
      ? 'translate(-72px, 54px) scale(1)'
      : 'translate(0px, 0px) scale(0.55)',
    phase === 'orbs-in'
      ? 'translate(72px, 54px) scale(1)'
      : 'translate(0px, 0px) scale(0.55)',
  ];

  return (
    <div ref={containerRef} className="relative min-h-[340px]">
      {/* Phase 1 & 2: Windows 7-style glowing orbs swirling & converging to center */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-500"
        style={{ opacity: showOrbs ? 1 : 0 }}
      >
        <div
          className="relative w-44 h-44 flex items-center justify-center transition-transform duration-[1100ms] ease-in-out"
          style={{
            transform: phase === 'converge' ? 'rotate(180deg) scale(0.85)' : 'rotate(0deg) scale(1)',
          }}
        >
          {/* Central merge glow */}
          <span
            className="absolute w-16 h-16 rounded-full transition-all duration-500"
            style={{
              background: 'radial-gradient(circle, rgba(52,211,153,0.55) 0%, rgba(16,185,129,0) 70%)',
              transform: phase === 'converge' ? 'scale(2.2)' : 'scale(0.4)',
              opacity: phase === 'converge' ? 1 : 0.2,
            }}
          />

          {PILLARS.map((pillar, idx) => (
            <span
              key={pillar.title}
              className="absolute w-3.5 h-3.5 rounded-full transition-all duration-[750ms] ease-in-out"
              style={{
                backgroundColor: pillar.orbColor,
                boxShadow: `0 0 18px 4px ${pillar.orbColor}88`,
                transform: orbPositions[idx],
                transitionDelay: `${idx * 75}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Phase 3: The 4 cards blossoming outward from the center into their 2x2 grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {PILLARS.map((pillar, idx) => (
          <div
            key={pillar.title}
            className="rounded-2xl bg-white border border-[#E4E7EC] hover:border-[#047857]/40 p-5 sm:p-6 shadow-2xs"
            style={{
              opacity: showCards ? 1 : 0,
              transform: showCards ? 'translate(0px, 0px) scale(1)' : pillar.originOffset,
              transition:
                'transform 750ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms ease-out, border-color 200ms ease',
              transitionDelay: showCards ? `${idx * 90}ms` : '0ms',
            }}
          >
            <span className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center">
              <pillar.icon className="w-5 h-5" />
            </span>
            <h3 className="mt-4 font-display text-base font-bold text-[#111827]">{pillar.title}</h3>
            <p className="mt-1.5 text-xs sm:text-sm text-[#4B5563] leading-relaxed">{pillar.text}</p>
          </div>
        ))}
      </div>

      {/* Discreet replay button */}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={playSequence}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6B7280] hover:text-[#047857] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Rejouer l’animation</span>
        </button>
      </div>
    </div>
  );
}
