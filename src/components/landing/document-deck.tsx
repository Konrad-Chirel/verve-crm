'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, ChevronRight } from 'lucide-react';

const SHEETS = [
  {
    ref: 'Réf. LM-2026-014',
    title: 'Lettre de mission',
    subtitle: 'Refonte plateforme web pour Lumina Studio',
    tag: 'PDF prêt',
    rows: [
      { label: 'Honoraires HT', value: '28 000 €' },
      { label: 'TVA 20 %', value: '5 600 €' },
    ],
    totalLabel: 'Total TTC',
    totalValue: '33 600 €',
  },
  {
    ref: 'Réf. PC-2026-021',
    title: 'Proposition commerciale',
    subtitle: 'Identité & architecture pour Nexus Conseil',
    tag: 'Signé · 85 %',
    rows: [
      { label: 'Accompagnement', value: '18 000 €' },
      { label: 'Ateliers direction', value: '4 000 €' },
    ],
    totalLabel: 'Total HT',
    totalValue: '22 000 €',
  },
  {
    ref: 'Réf. SF-2026-Q1',
    title: 'Synthèse financière T1',
    subtitle: 'Trésorerie & prévisions — Atelier Nova',
    tag: 'Rapport PDF',
    rows: [
      { label: 'Volume signé', value: '109 600 €' },
      { label: 'Pipeline pondéré', value: '118 925 €' },
    ],
    totalLabel: 'Objectif T1',
    totalValue: '92 % atteint',
  },
];

const TURN_DURATION_MS = 1250;
const AUTO_INTERVAL_MS = 5500;

export function DocumentDeck() {
  const [active, setActive] = useState(0);
  const [turningIdx, setTurningIdx] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flipPage = useCallback(() => {
    if (turningIdx !== null) return;
    setTurningIdx(active);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActive((prev) => (prev + 1) % SHEETS.length);
      setTurningIdx(null);
    }, TURN_DURATION_MS);
  }, [active, turningIdx]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || paused) return;

    const timer = setInterval(() => {
      flipPage();
    }, AUTO_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [paused, flipPage]);

  const jumpTo = (idx: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTurningIdx(null);
    setActive(idx);
  };

  return (
    <div
      className="relative mx-auto w-full max-w-[390px] pt-4 pb-4 px-2 sm:px-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 3D Page-Flip Binder Stage */}
      <div
        className="relative h-[304px] sm:h-[316px]"
        style={{ perspective: '1800px' }}
      >
        {/* Subtle binder shadow base */}
        <div
          className="absolute inset-x-3 top-6 bottom-2 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] translate-x-2 translate-y-2"
          aria-hidden
        />

        {SHEETS.map((sheet, idx) => {
          const slot = (idx - active + SHEETS.length) % SHEETS.length;
          const isTurning = turningIdx === idx;

          // Smooth physical page-turn around the left spine
          let transform = 'translateX(0px) translateY(0px) scale(1) rotateY(0deg)';
          let opacity = 1;
          let zIndex = 30;
          let transition =
            'transform 1250ms cubic-bezier(0.32, 0.08, 0.24, 1), opacity 1100ms ease-in-out';

          if (isTurning) {
            transform = 'translateX(-10px) translateY(-4px) rotateY(-112deg)';
            opacity = 0;
            zIndex = 40;
          } else if (slot === 0) {
            transform = 'translateX(0px) translateY(0px) scale(1) rotateY(0deg)';
            opacity = 1;
            zIndex = 30;
            transition =
              'transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease-out';
          } else if (slot === 1) {
            transform =
              turningIdx !== null
                ? 'translateX(0px) translateY(0px) scale(1) rotateY(0deg)'
                : 'translateX(7px) translateY(5px) scale(0.975) rotateY(0deg)';
            opacity = turningIdx !== null ? 1 : 0.85;
            zIndex = 20;
            transition =
              'transform 1250ms cubic-bezier(0.22, 1, 0.36, 1), opacity 1100ms ease-out';
          } else {
            transform = 'translateX(14px) translateY(10px) scale(0.95) rotateY(0deg)';
            opacity = 0.55;
            zIndex = 10;
            transition =
              'transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease-out';
          }

          return (
            <div
              key={sheet.ref}
              onClick={flipPage}
              role="button"
              tabIndex={slot === 0 ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  flipPage();
                }
              }}
              aria-label={`Feuilleter : ${sheet.title}`}
              className="absolute inset-x-0 top-3 rounded-2xl bg-white border border-[#E4E7EC] p-6 sm:p-7 shadow-[0_18px_44px_-22px_rgba(4,120,87,0.28)] cursor-pointer select-none overflow-hidden"
              style={{
                transformOrigin: 'left center',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                willChange: 'transform, opacity',
                transform,
                opacity,
                zIndex,
                transition,
              }}
            >
              {/* Subtle left spine crease */}
              <div
                className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-[#047857]/25"
                aria-hidden
              />
              {/* Soft page-turn light sweep while turning */}
              <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-700"
                style={{
                  opacity: isTurning ? 1 : 0,
                  background:
                    'linear-gradient(90deg, rgba(0,0,0,0.08) 0%, rgba(255,255,255,0.06) 35%, rgba(0,0,0,0.04) 100%)',
                }}
                aria-hidden
              />

              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-bold text-sm text-[#111827]">Atelier Nova</span>
                <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] text-[10px] font-semibold">
                  {sheet.tag}
                </span>
              </div>

              <div className="mt-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold text-[#111827] leading-snug">
                    {sheet.title}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5 truncate">{sheet.subtitle}</p>
                </div>
                <span className="text-[10px] text-[#9CA3AF] shrink-0 mt-1">{sheet.ref}</span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="h-2 rounded bg-[#F3F4F6] w-full" />
                <div className="h-2 rounded bg-[#F3F4F6] w-[86%]" />
              </div>

              <div className="mt-5 border-t border-[#E4E7EC] pt-3.5 space-y-1.5 text-xs">
                {sheet.rows.map((r) => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-[#4B5563]">{r.label}</span>
                    <span className="font-semibold text-[#111827] tabular-nums">{r.value}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-1">
                  <span className="text-[#111827]">{sheet.totalLabel}</span>
                  <span className="tabular-nums text-[#047857]">{sheet.totalValue}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sheet Switcher Footer */}
      <div className="mt-5 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          {SHEETS.map((s, idx) => (
            <button
              key={s.ref}
              type="button"
              onClick={() => jumpTo(idx)}
              aria-label={`Afficher ${s.title}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                active === idx ? 'w-7 bg-[#047857]' : 'w-2 bg-[#D0D5DD] hover:bg-[#9CA3AF]'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={flipPage}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#047857] hover:underline cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Feuilleter</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
