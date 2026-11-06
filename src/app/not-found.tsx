import Link from 'next/link';
import { ArrowLeft, LayoutDashboard, Kanban } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center font-display font-extrabold text-xl mb-4 shadow-2xs">
        404
      </div>
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#111827] tracking-tight mb-2">
        Page introuvable
      </h1>
      <p className="text-sm text-[#6B7280] max-w-md mb-8">
        L’adresse saisie ne correspond à aucun écran actif ou le dossier recherché a été déplacé.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard">
          <Button variant="primary" size="md">
            <LayoutDashboard className="w-4 h-4" />
            <span>Aller à la Synthèse</span>
          </Button>
        </Link>
        <Link href="/pipeline">
          <Button variant="secondary" size="md">
            <Kanban className="w-4 h-4" />
            <span>Voir le Pipeline</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
