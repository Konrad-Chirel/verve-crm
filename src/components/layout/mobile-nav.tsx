'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Kanban, Plus, FileSignature, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModal } from '@/context/modal-context';

export function MobileNav() {
  const pathname = usePathname();
  const { openNewDeal } = useModal();

  const isRouteActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    if (href.startsWith('/deals')) return pathname.startsWith('/deals');
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed md:hidden bottom-0 left-0 right-0 h-14 bg-white border-t border-border-base z-50 flex items-center justify-around px-2">
      <Link
        href="/dashboard"
        className={cn(
          'flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors',
          isRouteActive('/dashboard') ? 'text-primary font-semibold' : 'text-text-secondary'
        )}
      >
        <LayoutDashboard className="w-4 h-4 mb-0.5" />
        <span className="text-[11px] leading-none">Synthèse</span>
      </Link>

      <Link
        href="/pipeline"
        className={cn(
          'flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors',
          isRouteActive('/pipeline') ? 'text-primary font-semibold' : 'text-text-secondary'
        )}
      >
        <Kanban className="w-4 h-4 mb-0.5" />
        <span className="text-[11px] leading-none">Pipeline</span>
      </Link>

      <div className="flex items-center justify-center px-2">
        <button
          type="button"
          onClick={openNewDeal}
          className="h-9 px-3 rounded-md btn-primary flex items-center justify-center text-white shadow-primary active:scale-95 transition-transform"
          aria-label="Nouveau dossier"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <Link
        href="/deals/deal-lumina"
        className={cn(
          'flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors',
          isRouteActive('/deals') ? 'text-primary font-semibold' : 'text-text-secondary'
        )}
      >
        <FileSignature className="w-4 h-4 mb-0.5" />
        <span className="text-[11px] leading-none">Dossier</span>
      </Link>

      <Link
        href="/clients"
        className={cn(
          'flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors',
          isRouteActive('/clients') ? 'text-primary font-semibold' : 'text-text-secondary'
        )}
      >
        <Building2 className="w-4 h-4 mb-0.5" />
        <span className="text-[11px] leading-none">Clients</span>
      </Link>
    </nav>
  );
}
