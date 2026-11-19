import React from 'react';
import Link from 'next/link';
import { BRAND } from '@/lib/brand';

export function VerveAuthBrand() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group shrink-0">
      <span className="w-8 h-8 rounded-lg bg-[#047857] flex items-center justify-center text-white font-display font-bold text-sm shrink-0">
        V
      </span>
      <span className="flex flex-col">
        <span className="font-display font-bold text-base tracking-tight text-[#111827] leading-none whitespace-nowrap">
          {BRAND.shortName} CRM
        </span>
        <span className="hidden sm:block text-[11px] text-[#6B7280] font-medium mt-1">
          Registre commercial &amp; suivi de mandats B2B
        </span>
      </span>
    </Link>
  );
}

export function VerveAuthShowcase({ variant }: { variant: 'login' | 'register' }) {
  const history = [
    {
      date: '14/03',
      label: 'Réunion de cadrage technique validée avec Clara Morel',
      amount: null as string | null,
      dot: 'bg-[#9CA3AF]',
    },
    {
      date: '18/03',
      label: 'Proposition commerciale & lettre de mission transmises',
      amount: '28 000 € HT',
      dot: 'bg-[#D97706]',
    },
    {
      date: 'Auj. 10h30',
      label: 'Point de closing & validation du calendrier Q2',
      amount: 'Pondéré 19 600 €',
      dot: 'bg-[#047857]',
    },
  ];

  const headline =
    variant === 'login'
      ? 'Chaque mandat, sa probabilité de signature et sa prochaine relance.'
      : 'Structurez le pipeline et les relances de votre cabinet.';

  const subtitle =
    variant === 'login'
      ? 'Pipeline Kanban en 5 étapes, suivi des interlocuteurs décideurs, prévisions d’honoraires pondérées et génération de lettres de mission PDF.'
      : 'Renseignez l’identité de votre cabinet et vos objectifs d’honoraires pour initialiser votre registre commercial.';

  return (
    <aside className="hidden lg:flex lg:w-[46%] xl:w-1/2 flex-col justify-between bg-[#F1F5F3] border-r border-[#E4E7EC] px-12 xl:px-16 py-10">
      <VerveAuthBrand />

      <div className="flex flex-col gap-9 max-w-[450px]">
        {/* Real Product Vignette: Mandate Sheet */}
        <div className="rounded-2xl border border-[#E4E7EC] bg-white shadow-card overflow-hidden">
          <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#047857] text-white text-[11px] font-display font-bold flex items-center justify-center shrink-0">
                  LS
                </span>
                <p className="text-xs font-semibold text-[#6B7280] truncate">
                  Lumina Studio · Clara Morel (DG)
                </p>
              </div>
              <p className="font-display font-bold text-base text-[#111827] mt-1.5">
                Refonte Plateforme SaaS &amp; Design System
              </p>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] text-[11px] font-semibold">
              Proposition · 70 %
            </span>
          </div>

          <div className="px-6 pb-5">
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-display text-[26px] font-bold tracking-tight text-[#111827] tabular-nums leading-none">
                28 000 € <span className="text-xs font-sans font-medium text-[#6B7280]">HT</span>
              </p>
              <span className="text-xs font-semibold text-[#047857] tabular-nums">
                Valeur pondérée : 19 600 €
              </span>
            </div>

            <div className="mt-3.5 h-1.5 rounded-full bg-[#E5E9F0] overflow-hidden">
              <div className="h-full w-[70%] rounded-full bg-[#047857]" />
            </div>

            <div className="mt-2 flex justify-between text-[11px] text-[#6B7280]">
              <span>Qualification → Cadrage → Proposition</span>
              <span>Closing prévu : 30 mars</span>
            </div>
          </div>

          <ol className="border-t border-[#E4E7EC] bg-[#F9FAFB] px-6 py-4 flex flex-col gap-2.5">
            {history.map((item) => (
              <li key={item.date} className="flex items-center gap-2.5 text-xs">
                <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                <span className="w-16 shrink-0 text-[#6B7280] font-medium tabular-nums">
                  {item.date}
                </span>
                <span className="flex-1 min-w-0 truncate text-[#111827]">{item.label}</span>
                {item.amount && (
                  <span className="shrink-0 font-semibold text-[#111827] tabular-nums">
                    {item.amount}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h1 className="font-display text-[28px] xl:text-[32px] font-bold tracking-tight leading-[1.18] text-[#111827]">
            {headline}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#4B5563]">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[#6B7280]">
        <span>© 2026 Verve CRM</span>
        <span>PostgreSQL &amp; Row Level Security</span>
      </div>
    </aside>
  );
}
