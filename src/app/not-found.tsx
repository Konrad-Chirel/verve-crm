'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Kanban, RotateCcw } from 'lucide-react';

const MASCOT_QUIPS = [
  'J’ai fouillé tout le pipeline… ce dossier est introuvable !',
  'Même avec ma loupe émeraude, rien par ici.',
  'Cette page s’est peut-être glissée dans les archives du T4.',
  'Cliquez sur un bouton ci-dessous, je vous ramène en lieu sûr !',
];

export default function NotFound() {
  const router = useRouter();
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [quipIdx, setQuipIdx] = useState(0);
  const [hopping, setHopping] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / Math.max(1, cx);
      const dy = (e.clientY - cy) / Math.max(1, cy);
      setEyeOffset({
        x: Math.max(-4.5, Math.min(4.5, dx * 5)),
        y: Math.max(-3.5, Math.min(3.5, dy * 4)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const pokeMascot = () => {
    setQuipIdx((prev) => (prev + 1) % MASCOT_QUIPS.length);
    setHopping(false);
    requestAnimationFrame(() => setHopping(true));
  };

  return (
    <div className="min-h-screen bg-[#F7F8F7] text-[#111827] flex flex-col">
      <header className="px-5 sm:px-8 h-16 flex items-center justify-between max-w-6xl w-full mx-auto">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-[#047857] flex items-center justify-center text-white font-display font-bold text-sm">
            V
          </span>
          <span className="font-display font-bold text-base tracking-tight">Verve CRM</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-16 pt-4">
        <div className="w-full max-w-2xl text-center">
        {/* Big Editorial 4 [Animated Mascot] 4 Stage */}
        <div className="relative flex items-center justify-center gap-1 sm:gap-4 select-none">
          <span
            aria-hidden="true"
            className="font-display font-extrabold text-[84px] sm:text-[136px] leading-none tracking-tighter text-[#E4E7EC] dark:text-[#1E2B3C]"
            style={{ opacity: 0.9 }}
          >
            4
          </span>

          {/* Interactive Floating Mascot */}
          <button
            type="button"
            onClick={pokeMascot}
            aria-label="Mascotte Verve à la recherche du dossier perdu — cliquer pour interagir"
            title="Cliquez sur Vervy !"
            className={`relative w-44 h-44 sm:w-56 sm:h-56 shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#047857] rounded-full ${
              hopping ? 'animate-verve-hop' : ''
            }`}
            onAnimationEnd={() => setHopping(false)}
          >
            <svg
              viewBox="0 0 220 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full overflow-visible"
              role="img"
              aria-label="Illustration animée de la mascotte Verve CRM cherchant une page avec une loupe"
            >
              <defs>
                <radialGradient id="verveGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="bodyGrad" x1="60" y1="54" x2="155" y2="175" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="visorGrad" x1="72" y1="86" x2="148" y2="128" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0B131E" />
                  <stop offset="100%" stopColor="#162436" />
                </linearGradient>
                <linearGradient id="lensGrad" x1="156" y1="100" x2="188" y2="132" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.18" />
                </linearGradient>
              </defs>

              {/* Ambient Emerald Aura */}
              <circle cx="110" cy="112" r="88" fill="url(#verveGlow)" />

              {/* Drifting Lost Sheet (Top Left) */}
              <g className="animate-verve-drift-a">
                <rect
                  x="16"
                  y="44"
                  width="32"
                  height="40"
                  rx="6"
                  fill="#FFFFFF"
                  stroke="#A7F3D0"
                  strokeWidth="2"
                />
                <line x1="23" y1="56" x2="41" y2="56" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="23" y1="64" x2="37" y2="64" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                <line x1="23" y1="71" x2="33" y2="71" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Drifting Question Badge (Top Right) */}
              <g className="animate-verve-drift-b">
                <circle cx="182" cy="48" r="15" fill="#ECFDF5" stroke="#34D399" strokeWidth="2" />
                <text
                  x="182"
                  y="54"
                  textAnchor="middle"
                  fill="#047857"
                  fontSize="17"
                  fontWeight="800"
                  fontFamily="sans-serif"
                >
                  ?
                </text>
              </g>

              {/* Ground Shadow */}
              <ellipse
                cx="110"
                cy="192"
                rx="42"
                ry="8"
                fill="#047857"
                className="animate-verve-shadow"
              />

              {/* Floating Mascot Body */}
              <g className="animate-verve-float">
                {/* Antenna */}
                <line x1="110" y1="54" x2="110" y2="34" stroke="#34D399" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="110" cy="30" r="6" fill="#34D399" />
                <circle cx="110" cy="30" r="10" fill="#34D399" opacity="0.25" />

                {/* Left Arm (Scratching / Waving) */}
                <path
                  d="M64 128 C46 124, 42 108, 52 98"
                  stroke="#059669"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="52" cy="98" r="5.5" fill="#34D399" />

                {/* Rounded Folder-Bot Torso & Head */}
                <rect x="60" y="54" width="100" height="106" rx="34" fill="url(#bodyGrad)" />
                {/* Cute Folder Tab on top-left of head */}
                <path
                  d="M78 56 C78 48, 86 46, 94 46 L106 46 C112 46, 114 54, 114 56 Z"
                  fill="#059669"
                />
                {/* Soft highlight rim */}
                <rect
                  x="64"
                  y="58"
                  width="92"
                  height="98"
                  rx="30"
                  stroke="#A7F3D0"
                  strokeOpacity="0.35"
                  strokeWidth="2"
                />

                {/* Visor Screen */}
                <rect
                  x="73"
                  y="78"
                  width="74"
                  height="46"
                  rx="18"
                  fill="url(#visorGrad)"
                  stroke="#34D399"
                  strokeOpacity="0.45"
                  strokeWidth="1.5"
                />

                {/* Expressive Cursor-Tracking Blinking Eyes */}
                <g
                  style={{
                    transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                    transition: 'transform 120ms ease-out',
                  }}
                >
                  <g className="animate-verve-blink">
                    <circle cx="95" cy="100" r="6.5" fill="#34D399" />
                    <circle cx="97" cy="98" r="2.2" fill="#FFFFFF" />
                    <circle cx="125" cy="100" r="6.5" fill="#34D399" />
                    <circle cx="127" cy="98" r="2.2" fill="#FFFFFF" />
                  </g>
                </g>

                {/* Cute Puzzled Mouth */}
                <path
                  d="M104 114 Q110 111 116 114"
                  stroke="#6EE7B7"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Chest Monogram Badge */}
                <rect x="96" y="133" width="28" height="16" rx="6" fill="#065F46" />
                <text
                  x="110"
                  y="145"
                  textAnchor="middle"
                  fill="#A7F3D0"
                  fontSize="10"
                  fontWeight="800"
                  fontFamily="sans-serif"
                >
                  V
                </text>

                {/* Cute Floating Feet */}
                <rect x="82" y="162" width="18" height="10" rx="5" fill="#065F46" />
                <rect x="120" y="162" width="18" height="10" rx="5" fill="#065F46" />

                {/* Right Arm + Sweeping Magnifying Glass */}
                <g className="animate-verve-sweep">
                  <path
                    d="M156 128 C168 128, 174 122, 174 116"
                    stroke="#059669"
                    strokeWidth="9"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Handle */}
                  <line
                    x1="170"
                    y1="126"
                    x2="180"
                    y2="142"
                    stroke="#064E3B"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* Lens Ring */}
                  <circle
                    cx="172"
                    cy="112"
                    r="17"
                    fill="url(#lensGrad)"
                    stroke="#34D399"
                    strokeWidth="4"
                  />
                  {/* Lens Glint */}
                  <path
                    d="M163 105 A11 11 0 0 1 174 101"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                </g>
              </g>
            </svg>
          </button>

          <span
            aria-hidden="true"
            className="font-display font-extrabold text-[84px] sm:text-[136px] leading-none tracking-tighter text-[#E4E7EC] dark:text-[#1E2B3C]"
            style={{ opacity: 0.9 }}
          >
            4
          </span>
        </div>

        {/* Speech Bubble Quip */}
        <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E4E7EC] shadow-2xs text-xs sm:text-sm font-medium text-[#111827]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
          <span>{MASCOT_QUIPS[quipIdx]}</span>
        </div>

        {/* Copy */}
        <h1 className="mt-6 font-display text-2xl sm:text-4xl font-bold text-[#111827] tracking-tight">
          Oups, ce dossier s’est perdu en route.
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#4B5563] max-w-lg mx-auto leading-relaxed">
          La page demandée a peut-être été archivée, déplacée dans le pipeline ou son adresse comporte une faute de
          frappe.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <Link
            href="/"
            className="h-11 px-6 rounded-lg btn-primary text-sm font-semibold inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l’accueil</span>
          </Link>
          <Link
            href="/dashboard"
            className="h-11 px-5 rounded-lg bg-white hover:bg-[#F3F4F6] text-[#111827] border border-[#E4E7EC] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Kanban className="w-4 h-4 text-[#047857]" />
            <span>Ouvrir mon espace</span>
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="h-11 px-4 rounded-lg text-sm font-medium text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Page précédente</span>
          </button>
        </div>
        </div>
      </main>
    </div>
  );
}
