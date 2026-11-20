import Link from 'next/link';
import { ArrowLeft, Compass, Kanban } from 'lucide-react';
import { BRAND } from '@/lib/brand';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-[#E4E7EC] rounded-2xl p-6 sm:p-8 text-center shadow-2xs space-y-5">
        <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] text-[11px] font-semibold uppercase tracking-wider">
            Erreur 404 — {BRAND.shortName}
          </span>
          <h1 className="font-display text-2xl font-bold text-[#111827] tracking-tight">
            Ce dossier ou cette page est introuvable
          </h1>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            La ressource demandée a peut-être été archivée, déplacée dans le pipeline ou son adresse est incorrecte.
          </p>
        </div>

        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Link
            href="/"
            className="h-9 px-4 rounded-lg bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à l’accueil</span>
          </Link>
          <Link
            href="/dashboard"
            className="h-9 px-4 rounded-lg bg-white hover:bg-[#F3F4F6] text-[#111827] border border-[#E4E7EC] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <Kanban className="w-3.5 h-3.5 text-[#047857]" />
            <span>Ouvrir mon espace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
