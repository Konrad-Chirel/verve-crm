import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Comment Verve CRM collecte, protège et stocke vos données personnelles et commerciales conformément au RGPD.',
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-[#F7F8F7] text-[#111827]">
      <header className="sticky top-0 z-30 bg-[#F7F8F7]/90 backdrop-blur border-b border-[#E4E7EC]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#047857] flex items-center justify-center text-white font-display font-bold text-sm">
              V
            </span>
            <span className="font-display font-bold text-base tracking-tight">Verve CRM</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#4B5563] hover:text-[#111827] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l’accueil</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#047857] mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Conformité RGPD</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Politique de confidentialité
        </h1>
        <p className="mt-3 text-sm text-[#4B5563]">
          Dernière mise à jour : 20 novembre 2026
        </p>

        <div className="mt-10 space-y-8 text-sm sm:text-[15px] text-[#4B5563] leading-relaxed bg-white border border-[#E4E7EC] rounded-2xl p-6 sm:p-10 shadow-2xs">
          <section className="space-y-2.5">
            <h2 className="font-display text-lg font-bold text-[#111827]">
              1. Responsable du traitement
            </h2>
            <p>
              L’application <strong>Verve CRM</strong> est éditée par <strong>Konrad Chirel</strong>. Elle permet aux
              cabinets de conseil, agences et indépendants B2B de piloter leur pipeline commercial, leurs comptes
              clients et leurs documents contractuels.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display text-lg font-bold text-[#111827]">
              2. Données collectées et finalités
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Compte &amp; authentification</strong> : adresse e-mail, nom complet, fonction, nom du cabinet
                et, en cas de connexion via Google OAuth, photo de profil publique. Ces données servent exclusivement à
                vous identifier et à personnaliser vos lettres de mission PDF.
              </li>
              <li>
                <strong>Données métier CRM</strong> : dossiers (mandats), sociétés, interlocuteurs, relances, notes de
                journal et pièces jointes que vous choisissez d’enregistrer dans votre espace.
              </li>
              <li>
                <strong>Mode démonstration</strong> : aucune donnée personnelle n’est transmise à nos serveurs ; vos
                modifications restent stockées localement dans le navigateur (<code>localStorage</code>) et sont purgées
                dès que vous quittez la session.
              </li>
              <li>
                <strong>Mesure d’audience (uniquement avec votre accord)</strong> : si vous acceptez la mesure
                d’audience dans le bandeau cookies, Vercel Analytics collecte des statistiques agrégées et anonymisées
                (pages vues, performances) sans suivi publicitaire tiers.
              </li>
            </ul>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display text-lg font-bold text-[#111827]">
              3. Hébergement et sécurité des données
            </h2>
            <p>
              L’application est hébergée sur <strong>Vercel</strong> et la base de données PostgreSQL ainsi que le
              stockage privé des pièces jointes (bucket <code>verve-documents</code>) sont hébergés sur{' '}
              <strong>Supabase</strong> (région Union Européenne, <code>eu-west-1</code>).
            </p>
            <p>
              Chaque enregistrement et chaque fichier est isolé par des politiques PostgreSQL{' '}
              <strong>Row Level Security (RLS)</strong> liées à votre identifiant unique (<code>auth.uid()</code>), et
              toutes les communications sont chiffrées en <strong>HTTPS / TLS</strong> (HSTS preload).
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display text-lg font-bold text-[#111827]">
              4. Cookies et traceurs
            </h2>
            <p>
              Verve CRM utilise uniquement des cookies techniques strictement nécessaires à la session d’authentification
              (cookies <code>sb-*</code> Supabase ou <code>verve_demo_mode</code>) et des préférences locales (thème
              clair/sombre, choix de consentement). Aucun cookie publicitaire ni revente de données n’est pratiqué.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display text-lg font-bold text-[#111827]">
              5. Vos droits (RGPD) et portabilité
            </h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d’un droit d’accès,
              de rectification, de portabilité et d’effacement de vos données :
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Portabilité immédiate</strong> : exportez l’intégralité de votre espace au format JSON ou CSV à
                tout moment depuis la page <strong>Paramètres</strong> ou <strong>Répertoire clients</strong>.
              </li>
              <li>
                <strong>Suppression</strong> : vous pouvez supprimer vos dossiers, sociétés, relances, notes et pièces
                jointes directement depuis l’interface, ou demander la suppression intégrale de votre compte.
              </li>
            </ul>
          </section>
        </div>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 text-xs text-[#6B7280]">
          <span>© 2026 Verve CRM — Konrad Chirel</span>
          <div className="flex items-center gap-5">
            <Link href="/cgu" className="hover:text-[#111827] underline-offset-4 hover:underline">
              Conditions générales d’utilisation
            </Link>
            <Link href="/" className="hover:text-[#111827] underline-offset-4 hover:underline">
              Accueil
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
