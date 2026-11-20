import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Conditions générales d’utilisation',
  description:
    'Conditions générales d’utilisation de l’application SaaS Verve CRM (accès, compte, propriété des données et responsabilité).',
};

export default function CGUPage() {
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
          <FileText className="w-3.5 h-3.5" />
          <span>Mentions contractuelles</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Conditions générales d’utilisation
        </h1>
        <p className="mt-3 text-sm text-[#4B5563]">
          Dernière mise à jour : 20 novembre 2026
        </p>

        <div className="mt-10 space-y-8 text-sm sm:text-[15px] text-[#4B5563] leading-relaxed bg-white border border-[#E4E7EC] rounded-2xl p-6 sm:p-10 shadow-2xs">
          <section className="space-y-2.5">
            <h2 className="font-display text-lg font-bold text-[#111827]">1. Objet du service</h2>
            <p>
              Les présentes Conditions Générales d’Utilisation (CGU) régissent l’accès et l’utilisation de la plateforme
              web <strong>Verve CRM</strong>, un outil de gestion de pipeline commercial, de suivi clients, de
              prévisions de trésorerie et d’édition documentaire PDF destiné aux professionnels B2B.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display text-lg font-bold text-[#111827]">
              2. Accès au service et création de compte
            </h2>
            <p>
              Verve CRM est accessible en <strong>mode démonstration</strong> sans inscription (avec des données fictives
              stockées uniquement sur votre appareil) ou via la création d’un <strong>compte personnel sécurisé</strong>{' '}
              (e-mail/mot de passe ou Google OAuth).
            </p>
            <p>
              L’utilisateur s’engage à fournir des informations exactes lors de son inscription et à préserver la
              confidentialité de ses identifiants de connexion.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display text-lg font-bold text-[#111827]">
              3. Propriété de vos données
            </h2>
            <p>
              Vous demeurez l’unique propriétaire de l’ensemble des données commerciales, contacts, notes et fichiers
              importés dans votre espace Verve CRM. Vous pouvez exporter l’intégralité de vos données à tout moment aux
              formats JSON, CSV et PDF.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display text-lg font-bold text-[#111827]">
              4. Usage acceptable et sécurité
            </h2>
            <p>
              Il est interdit d’utiliser le service pour héberger des fichiers malveillants, tenter d’accéder aux données
              d’autres utilisateurs, contourner les mécanismes d’authentification ou soumettre des requêtes automatisées
              abusives. Les fichiers importés sont limités à 10 Mo et aux formats bureautiques/images autorisés.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display text-lg font-bold text-[#111827]">
              5. Propriété intellectuelle &amp; disponibilité
            </h2>
            <p>
              Le code source, l’interface graphique, les marques et les éléments éditoriaux de Verve CRM sont protégés
              par les lois relatives à la propriété intellectuelle. Le service est fourni « en l’état » dans le cadre
              d’une obligation de moyens ; l’utilisateur est invité à conserver des sauvegardes JSON régulières de ses
              données critiques.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display text-lg font-bold text-[#111827]">
              6. Protection des données personnelles
            </h2>
            <p>
              Le traitement des données personnelles est détaillé dans notre{' '}
              <Link href="/confidentialite" className="font-semibold text-[#047857] hover:underline">
                Politique de confidentialité
              </Link>
              .
            </p>
          </section>
        </div>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 text-xs text-[#6B7280]">
          <span>© 2026 Verve CRM — Konrad Chirel</span>
          <div className="flex items-center gap-5">
            <Link href="/confidentialite" className="hover:text-[#111827] underline-offset-4 hover:underline">
              Politique de confidentialité
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
