'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sun,
  Moon,
  FileText,
  ShieldCheck,
  Download,
  CalendarClock,
  KanbanSquare,
  Menu,
  X,
  Plus,
  Check,
  Sparkles,
} from 'lucide-react';
import { useCRM } from '@/context/crm-context';
import { DocumentDeck } from '@/components/landing/document-deck';
import { SecurityCards } from '@/components/landing/security-cards';

/* ---------------------------------------------------------------------------
   Hero demo data — the stage ladder used throughout Verve
   --------------------------------------------------------------------------- */
const LADDER = [
  { name: 'Qualification', prob: 25, color: '#0D9488' },
  { name: 'Cadrage', prob: 50, color: '#0284C7' },
  { name: 'Proposition', prob: 70, color: '#D97706' },
  { name: 'Négociation', prob: 85, color: '#059669' },
  { name: 'Signé', prob: 100, color: '#047857' },
];

const INITIAL_ROWS = [
  { id: 'a', company: 'Lumina Studio', initials: 'LS', mission: 'Refonte plateforme web', amount: 28000, stage: 2 },
  { id: 'b', company: 'Nexus Conseil', initials: 'NC', mission: 'Identité & architecture de marque', amount: 22000, stage: 1 },
  { id: 'c', company: 'Altis Lab', initials: 'AL', mission: 'Atelier positionnement', amount: 7500, stage: 3 },
  { id: 'd', company: 'Solis Media', initials: 'SM', mission: 'Cadrage stratégique tech', amount: 12000, stage: 0 },
];

const euro = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

function useAnimatedNumber(target: number, duration = 450) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(target);
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

/* ---------------------------------------------------------------------------
   Live pipeline: the hero interactive moment
   --------------------------------------------------------------------------- */
function LivePipeline() {
  const [rows, setRows] = useState(INITIAL_ROWS);

  const { gross, weighted, signed } = useMemo(() => {
    let g = 0;
    let w = 0;
    let s = 0;
    rows.forEach((r) => {
      g += r.amount;
      w += (r.amount * LADDER[r.stage].prob) / 100;
      if (r.stage === 4) s += r.amount;
    });
    return { gross: g, weighted: Math.round(w), signed: s };
  }, [rows]);

  const animatedWeighted = useAnimatedNumber(weighted);
  const animatedSigned = useAnimatedNumber(signed);

  const setStage = (id: string, stage: number) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, stage } : r)));

  return (
    <div className="relative rounded-2xl bg-white border border-[#E4E7EC] shadow-[0_24px_60px_-28px_rgba(4,120,87,0.35)] overflow-hidden min-w-0">
      {/* Totals */}
      <div className="grid grid-cols-3 divide-x divide-[#E4E7EC] border-b border-[#E4E7EC]">
        <div className="px-3 sm:px-5 py-3.5 min-w-0">
          <p className="text-[11px] font-medium text-[#6B7280] truncate">Volume brut</p>
          <p className="font-display text-[15px] sm:text-lg font-bold text-[#111827] tabular-nums whitespace-nowrap">
            {euro(gross)}
          </p>
        </div>
        <div className="px-3 sm:px-5 py-3.5 min-w-0">
          <p className="text-[11px] font-medium text-[#6B7280] truncate">Pondéré</p>
          <p
            className="font-display text-[15px] sm:text-lg font-bold text-[#047857] tabular-nums whitespace-nowrap"
            aria-live="polite"
          >
            {euro(animatedWeighted)}
          </p>
        </div>
        <div className="px-3 sm:px-5 py-3.5 min-w-0">
          <p className="text-[11px] font-medium text-[#6B7280] truncate">Signé</p>
          <p className="font-display text-[15px] sm:text-lg font-bold text-[#111827] tabular-nums whitespace-nowrap">
            {euro(animatedSigned)}
          </p>
        </div>
      </div>

      {/* Rows */}
      <ul className="divide-y divide-[#E4E7EC]">
        {rows.map((row) => {
          const stage = LADDER[row.stage];
          return (
            <li key={row.id} className="px-3.5 sm:px-5 py-4">
              <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-[#F3F4F6] border border-[#E4E7EC] text-[11px] font-bold text-[#111827] flex items-center justify-center shrink-0">
                    {row.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] sm:text-sm font-semibold text-[#111827] truncate">{row.mission}</p>
                    <p className="text-xs text-[#6B7280] truncate">{row.company}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-[13px] sm:text-sm font-bold text-[#111827] tabular-nums whitespace-nowrap">
                    {euro(row.amount)}
                  </p>
                  <p className="text-[11px] font-semibold tabular-nums whitespace-nowrap" style={{ color: stage.color }}>
                    {stage.name} {stage.prob} %
                  </p>
                </div>
              </div>

              {/* Stage ladder: click any step */}
              <div className="mt-3 grid grid-cols-5 gap-1.5" role="group" aria-label={`Étape du dossier ${row.company}`}>
                {LADDER.map((s, idx) => {
                  const reached = idx <= row.stage;
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setStage(row.id, idx)}
                      aria-pressed={idx === row.stage}
                      aria-label={`Passer à ${s.name}`}
                      title={s.name}
                      className="group h-6 flex items-center cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]"
                    >
                      <span
                        className={`block w-full h-1.5 rounded-full transition-all duration-300 group-hover:h-2.5 ${
                          reached ? '' : 'bg-[#E5E7EB]'
                        }`}
                        style={reached ? { backgroundColor: stage.color } : undefined}
                      />
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="px-3.5 sm:px-5 py-3 bg-[#F9FAFB] border-t border-[#E4E7EC] flex items-center justify-between gap-3">
        <p className="text-xs text-[#6B7280]">Cliquez sur une étape pour faire avancer un dossier.</p>
        <button
          type="button"
          onClick={() => setRows(INITIAL_ROWS)}
          className="text-xs font-semibold text-[#047857] hover:underline cursor-pointer shrink-0"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Animated 3-step sequence: "Un dossier, trois gestes."
   --------------------------------------------------------------------------- */
const STEPS = [
  {
    title: 'Qualifiez',
    text: 'Chaque nouvelle piste entre en Qualification avec son décideur, son montant d’honoraires et sa prochaine action datée.',
    badge: 'Probabilité 25 % · Relance planifiée',
  },
  {
    title: 'Proposez',
    text: 'Passez en Proposition et générez la lettre de mission PDF au nom de votre cabinet, prête à être envoyée.',
    badge: 'Lettre de mission PDF · 28 000 € HT',
  },
  {
    title: 'Signez',
    text: 'Glissez le dossier en Signé : le chiffre d’affaires sécurisé et l’objectif du trimestre se mettent à jour.',
    badge: 'Mandat signé · Trésorerie actualisée',
  },
];

function MethodSteps() {
  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || paused) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 3400);

    return () => clearInterval(interval);
  }, [paused]);

  return (
    <section
      id="methode"
      className="border-y border-[#E4E7EC] bg-white scroll-mt-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Un dossier, trois gestes.
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#4B5563] max-w-xl">
              Cliquez sur une étape ou laissez dérouler le cycle d’un mandat.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 self-start sm:self-auto" aria-hidden>
            {STEPS.map((s, idx) => (
              <button
                key={s.title}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  activeStep === idx ? 'w-8 bg-[#047857]' : 'w-2.5 bg-[#D0D5DD] hover:bg-[#9CA3AF]'
                }`}
                aria-label={`Étape ${idx + 1} : ${s.title}`}
              />
            ))}
          </div>
        </div>

        <div className="relative mt-10 sm:mt-14">
          {/* Desktop edge-to-edge progress track: 1 (left) -> 2 (center) -> 3 (right) */}
          <div
            className="hidden md:block absolute top-5 left-5 right-5 h-[3px] rounded-full bg-[#E4E7EC] overflow-hidden"
            aria-hidden
          >
            <div
              className="h-full bg-[#047857] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
            />
          </div>

          <ol className="grid md:grid-cols-3 gap-5 md:gap-6">
            {STEPS.map((step, idx) => {
              const isActive = idx === activeStep;
              const isCompleted = idx < activeStep;
              const markerAlign =
                idx === 0
                  ? 'justify-start'
                  : idx === 1
                  ? 'justify-start md:justify-center'
                  : 'justify-start md:justify-end';

              return (
                <li key={step.title} className="relative flex flex-col">
                  {/* Step marker: 1 at left edge, 2 at center, 3 at right edge on desktop */}
                  <div className={`flex ${markerAlign} mb-5 relative z-10`}>
                    <button
                      type="button"
                      onClick={() => setActiveStep(idx)}
                      aria-current={isActive ? 'step' : undefined}
                      className={`relative w-10 h-10 rounded-full font-display font-bold text-sm flex items-center justify-center shrink-0 transition-all duration-500 cursor-pointer ${
                        isActive
                          ? 'bg-[#047857] text-white ring-4 ring-[#047857]/20 scale-105'
                          : isCompleted
                          ? 'bg-[#ECFDF5] border-2 border-[#047857] text-[#047857]'
                          : 'bg-white border-2 border-[#D0D5DD] text-[#6B7280] hover:border-[#047857] hover:text-[#047857]'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                    </button>
                  </div>

                  {/* Step card */}
                  <button
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`flex-1 text-left rounded-2xl p-6 border transition-all duration-500 cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'bg-[#ECFDF5]/60 border-[#047857]/40 shadow-[0_14px_32px_-20px_rgba(4,120,87,0.35)] -translate-y-1'
                        : 'bg-[#F9FAFB] border-[#E4E7EC] hover:border-[#D0D5DD]'
                    }`}
                  >
                    <div>
                      <h3
                        className={`font-display text-xl font-bold transition-colors duration-300 ${
                          isActive ? 'text-[#047857]' : 'text-[#111827]'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="mt-2.5 text-sm text-[#4B5563] leading-relaxed">{step.text}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#E4E7EC]/80 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 transition-all duration-300 ${
                          isActive ? 'bg-[#047857] animate-pulse' : 'bg-[#D0D5DD]'
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold transition-colors duration-300 ${
                          isActive ? 'text-[#047857]' : 'text-[#6B7280]'
                        }`}
                      >
                        {step.badge}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Styled, spacious 2-column FAQ Section
   --------------------------------------------------------------------------- */
const FAQ = [
  {
    q: 'Puis-je essayer Verve sans créer de compte ?',
    a: 'Oui. Le bouton « Explorer la démo » ouvre directement le cabinet fictif Atelier Nova avec ses 13 dossiers, ses clients et ses relances du jour. Vous pouvez tout manipuler et vos modifications restent dans votre navigateur.',
  },
  {
    q: 'Où sont stockées mes données avec un compte ?',
    a: 'Vos mandats, comptes clients, relances et notes sont enregistrés dans une base PostgreSQL hébergée par Supabase. Chaque enregistrement est isolé par des règles Row Level Security liées à votre identifiant : aucun autre compte ne peut les consulter.',
  },
  {
    q: 'Comment sont calculées les prévisions d’honoraires ?',
    a: 'Chaque étape du pipeline porte une probabilité par défaut (25 %, 50 %, 70 %, 85 %, 100 %) que vous pouvez ajuster dossier par dossier. Verve multiplie automatiquement vos honoraires HT par cette probabilité pour projeter votre trésorerie réelle.',
  },
  {
    q: 'Verve convient-il à une équipe commerciale complète ?',
    a: 'Verve est volontairement taillé pour un associé, un indépendant ou un directeur de clientèle qui pilote son propre portefeuille sans lourdeur administrative. Les espaces multi-utilisateurs arriveront dans une prochaine version.',
  },
  {
    q: 'Puis-je récupérer ou exporter mes documents à tout moment ?',
    a: 'Oui. Le répertoire des comptes s’exporte en CSV compatible Excel, chaque dossier génère sa lettre de mission en PDF et la page Trésorerie produit un rapport financier exécutif en un clic.',
  },
];

function FaqSection({ onOpenDemo }: { onOpenDemo: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-[#E4E7EC] bg-white scroll-mt-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-10 lg:gap-16 items-start">
          {/* Left column: sticky editorial intro */}
          <div className="lg:sticky lg:top-24">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              Questions fréquentes
            </h2>
            <p className="mt-4 text-base text-[#4B5563] leading-relaxed max-w-md">
              Tout ce qu’il faut savoir sur la démo interactive, la confidentialité de vos dossiers et l’export de vos
              données.
            </p>
            <div className="mt-8 p-5 rounded-2xl bg-[#F7F8F7] border border-[#E4E7EC] max-w-md">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[#111827]">
                <Sparkles className="w-4 h-4 text-[#047857] shrink-0" />
                <span>Le plus simple reste de tester en direct</span>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                Ouvrez l’espace pré-rempli d’Atelier Nova pour voir le Kanban, les fiches dossiers et les graphiques en
                conditions réelles.
              </p>
              <button
                type="button"
                onClick={onOpenDemo}
                className="mt-4 h-10 px-4 rounded-lg btn-primary text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Lancer la démo interactive
              </button>
            </div>
          </div>

          {/* Right column: spacious styled accordion cards */}
          <div className="space-y-3.5">
            {FAQ.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={item.q}
                  className={`rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? 'bg-[#ECFDF5]/40 border-[#047857]/40 shadow-2xs'
                      : 'bg-[#F9FAFB] border-[#E4E7EC] hover:border-[#D0D5DD]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full px-5 sm:px-6 py-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className="font-display text-base sm:text-lg font-bold text-[#111827] leading-snug">
                      {item.q}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isOpen
                          ? 'bg-[#047857] border-[#047857] text-white'
                          : 'bg-white border-[#E4E7EC] text-[#4B5563]'
                      }`}
                    >
                      <Plus
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isOpen ? 'rotate-45' : 'rotate-0'
                        }`}
                      />
                    </span>
                  </button>

                  <div
                    className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
                    style={{
                      gridTemplateRows: isOpen ? '1fr' : '0fr',
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 sm:px-6 pb-6 text-sm sm:text-[15px] text-[#4B5563] leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Features data & Page
   --------------------------------------------------------------------------- */
const FEATURES = [
  {
    icon: KanbanSquare,
    title: 'Pipeline en 5 étapes',
    text: 'Kanban glisser-déposer ou vue registre. Probabilité fixée par étape, priorité libre dans chaque colonne.',
  },
  {
    icon: CalendarClock,
    title: 'Relances du jour',
    text: 'La liste des appels et e-mails à faire aujourd’hui, avec le montant en jeu. Cochez, reportez de deux heures, passez au suivant.',
  },
  {
    icon: Download,
    title: 'Rapports exportables',
    text: 'Projection sur six mois, simulateur de closing et synthèse financière PDF. Répertoire clients en CSV.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, isDemoMode, enableDemoMode, theme, toggleTheme } = useCRM();
  const [menuOpen, setMenuOpen] = useState(false);
  const hasSpace = Boolean(user) || isDemoMode;

  const openDemo = () => {
    enableDemoMode();
    router.push('/dashboard');
  };

  const navLinks = [
    { href: '#methode', label: 'Méthode' },
    { href: '#fonctionnalites', label: 'Fonctionnalités' },
    { href: '#securite', label: 'Sécurité' },
    { href: '#faq', label: 'Questions' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F7] text-[#111827] overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-[#F7F8F7]/90 backdrop-blur border-b border-[#E4E7EC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2.5 shrink-0">
            <span className="w-8 h-8 rounded-lg bg-[#047857] flex items-center justify-center text-white font-display font-bold text-sm shrink-0">
              V
            </span>
            <span className="font-display font-bold text-base tracking-tight whitespace-nowrap">Verve CRM</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7" aria-label="Sections">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-[#4B5563] hover:text-[#111827] transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Changer de thème"
              className="w-9 h-9 rounded-lg border border-[#E4E7EC] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#34D399]" /> : <Moon className="w-4 h-4" />}
            </button>
            {hasSpace ? (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex h-9 px-4 items-center rounded-lg btn-primary text-sm font-semibold whitespace-nowrap"
              >
                Ouvrir mon espace
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex h-9 px-3.5 items-center rounded-lg text-sm font-semibold text-[#111827] hover:bg-[#F3F4F6] whitespace-nowrap"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex h-9 px-4 items-center rounded-lg btn-primary text-sm font-semibold whitespace-nowrap"
                >
                  Créer un espace
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Menu"
              className="md:hidden w-9 h-9 rounded-lg border border-[#E4E7EC] bg-white flex items-center justify-center text-[#111827] cursor-pointer"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-[#E4E7EC] bg-[#F7F8F7] px-4 py-4 space-y-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-sm font-medium text-[#111827]"
              >
                {l.label}
              </a>
            ))}
            <div className="pt-3 grid grid-cols-2 gap-2">
              {hasSpace ? (
                <Link
                  href="/dashboard"
                  className="col-span-2 h-10 inline-flex items-center justify-center rounded-lg btn-primary text-sm font-semibold"
                >
                  Ouvrir mon espace
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="h-10 inline-flex items-center justify-center rounded-lg border border-[#E4E7EC] bg-white text-sm font-semibold"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/register"
                    className="h-10 inline-flex items-center justify-center rounded-lg btn-primary text-sm font-semibold"
                  >
                    Créer un espace
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 sm:pt-18 lg:pt-20 pb-16 sm:pb-20 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
          <div className="min-w-0">
            <h1 className="font-display text-[32px] sm:text-[48px] lg:text-[58px] font-bold tracking-[-0.035em] leading-[1.04]">
              Sachez ce que votre cabinet va vraiment signer.
            </h1>
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-[#4B5563] leading-relaxed max-w-[34rem]">
              Verve suit chaque mandat de la première prise de contact à la signature, pondère vos honoraires par
              étape et vous dit qui relancer aujourd’hui.
            </p>
            <div className="mt-7 sm:mt-8 flex flex-col items-start gap-3">
              <button
                type="button"
                onClick={openDemo}
                className="w-full sm:w-auto h-12 px-7 rounded-lg btn-primary text-sm font-semibold cursor-pointer shadow-sm"
              >
                Explorer la démo gratuite
              </button>
              <p className="text-xs text-[#6B7280]">
                Accès immédiat sans inscription ·{' '}
                <Link href="/register" className="font-semibold text-[#047857] hover:underline">
                  ou créer votre espace cloud
                </Link>
              </p>
            </div>
          </div>

          <LivePipeline />
        </section>

        {/* Animated 3-step method */}
        <MethodSteps />

        {/* Document proof with animated page-flipping sheets */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <DocumentDeck />
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#047857] mb-4">
              <FileText className="w-3.5 h-3.5" />
              <span>Documents automatisés</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              La lettre de mission part en un clic.
            </h2>
            <p className="mt-4 text-[#4B5563] leading-relaxed max-w-md">
              Depuis la fiche dossier, Verve génère un PDF à l’en-tête de votre cabinet avec le client, le périmètre et
              les honoraires déjà renseignés. Plus de copier-coller entre le CRM et un modèle Word.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-[#4B5563]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#047857] shrink-0" />
                <span>Lettres de mission &amp; propositions chiffrées HT / TTC</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#047857] shrink-0" />
                <span>Synthèse financière PDF sur 6 mois pour vos associés</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Features */}
        <section id="fonctionnalites" className="bg-white border-y border-[#E4E7EC] scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl">
              Ce dont un associé a besoin le lundi matin.
            </h2>
            <div className="mt-10 sm:mt-12 grid md:grid-cols-3 gap-px bg-[#E4E7EC] border border-[#E4E7EC] rounded-xl overflow-hidden">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-white p-6 sm:p-7">
                  <f.icon className="w-6 h-6 text-[#047857]" />
                  <h3 className="mt-5 font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-[#4B5563] leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rich 2-column Security Architecture Section */}
        <section id="securite" className="max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-28 scroll-mt-16">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#047857] mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Confidentialité &amp; Architecture</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Vos honoraires ne regardent que vous.
              </h2>
              <p className="mt-4 text-base text-[#4B5563] leading-relaxed">
                Les données commerciales d’un cabinet sont sensibles. Verve isole chaque portefeuille au niveau même de
                la base de données et protège chaque session contre les attaques web courantes.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {['PostgreSQL RLS', 'OAuth 2.0 PKCE', 'CSP & HSTS Strict', 'Audit OWASP'].map((pill) => (
                  <span
                    key={pill}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#E4E7EC] text-xs font-semibold text-[#111827]"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <SecurityCards />
          </div>
        </section>

        {/* Styled FAQ */}
        <FaqSection onOpenDemo={openDemo} />

        {/* Closing CTA — fixed deep forest, same in both themes */}
        <section className="px-4 sm:px-8 py-16 sm:py-20">
          <div
            className="max-w-6xl mx-auto rounded-2xl px-6 sm:px-12 py-12 sm:py-16 flex flex-col lg:flex-row lg:items-center justify-between gap-8"
            style={{ backgroundColor: '#053B2C' }}
          >
            <div className="max-w-xl">
              <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
                Ouvrez le pipeline d’Atelier Nova.
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: '#A7F3D0' }}>
                Treize dossiers, des relances du jour et un trimestre à boucler. Faites le tour en deux minutes.
              </p>
            </div>
            <div className="flex flex-col items-stretch sm:items-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={openDemo}
                className="h-12 px-7 rounded-lg text-sm font-semibold cursor-pointer transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FFFFFF', color: '#053B2C' }}
              >
                Explorer la démo gratuite
              </button>
              <Link
                href="/register"
                className="text-xs font-medium text-center sm:text-right hover:underline"
                style={{ color: '#A7F3D0' }}
              >
                ou créer votre compte cloud gratuitement
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E4E7EC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#6B7280] text-center md:text-left">
          <span>© 2026 Verve CRM. Conçu par Konrad Chirel.</span>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/login" className="hover:text-[#111827]">Se connecter</Link>
            <Link href="/register" className="hover:text-[#111827]">Créer un espace</Link>
            <Link href="/confidentialite" className="hover:text-[#111827]">Confidentialité</Link>
            <Link href="/cgu" className="hover:text-[#111827]">CGU</Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('verve:open-cookie-settings'))}
              className="hover:text-[#111827] cursor-pointer"
            >
              Gérer les cookies
            </button>
            <a
              href="https://github.com/Konrad-Chirel/verve-crm"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#111827]"
            >
              Code source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
