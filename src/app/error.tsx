'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Verve CRM Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-[#E4E7EC] rounded-2xl shadow-sm p-6 sm:p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] text-[11px] font-semibold">
            Interruption temporaire
          </span>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
            Une erreur inattendue est survenue
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            L’affichage de cette vue a rencontré un incident technique. Vos données de mandats et de comptes sont intactes.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => reset()}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Réessayer</span>
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button type="button" variant="secondary" size="md" className="w-full">
              <ArrowLeft className="w-4 h-4" />
              <span>Tableau de bord</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
