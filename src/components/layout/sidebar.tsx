'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Kanban,
  FileSignature,
  Building2,
  TrendingUp,
  SlidersHorizontal,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/brand';
import { Avatar } from '@/components/ui/avatar';
import { useCRM } from '@/context/crm-context';

export function Sidebar() {
  const pathname = usePathname();
  const { deals, companies, relances, profile, signOut } = useCRM();

  const activeRelancesCount = relances.filter((r) => !r.done).length;

  const NAV_AFFAIRES = [
    {
      href: '/dashboard',
      label: 'Synthèse',
      icon: LayoutDashboard,
      badge: activeRelancesCount > 0 ? activeRelancesCount : undefined,
    },
    {
      href: '/pipeline',
      label: 'Pipeline',
      icon: Kanban,
      badge: deals.length,
    },
    {
      href: '/deals/deal-lumina',
      label: 'Dossier actif',
      icon: FileSignature,
    },
    {
      href: '/clients',
      label: 'Répertoire',
      icon: Building2,
      badge: companies.length,
    },
  ];

  const NAV_SYSTEME = [
    { href: '/rapports', label: 'Trésorerie & Flux', icon: TrendingUp },
    { href: '/parametres', label: 'Paramètres', icon: SlidersHorizontal },
  ];

  const isRouteActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    if (href.startsWith('/deals')) return pathname.startsWith('/deals');
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 bottom-0 bg-white border-r border-[#E4E7EC] z-50',
        'hidden md:flex flex-col justify-between',
        'w-[68px] xl:w-60'
      )}
    >
      {/* Top Header / Logo zone */}
      <div>
        <div className="h-16 flex items-center px-4 xl:px-5 border-b border-[#E4E7EC]">
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#047857] flex items-center justify-center text-white font-display font-bold text-sm shrink-0">
              V
            </div>
            <div className="hidden xl:flex items-baseline gap-2 min-w-0">
              <span className="font-display font-bold text-[16px] tracking-tight text-[#111827] truncate">
                {BRAND.shortName}
              </span>
              <span className="text-xs text-[#6B7280] truncate">
                {profile.agency}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-6 mt-1">
          {/* Section 1: Opérations */}
          <div>
            <div className="hidden xl:block px-3 mb-1.5 text-xs font-medium text-[#6B7280]">
              Opérations
            </div>
            <nav className="space-y-0.5">
              {NAV_AFFAIRES.map((item) => {
                const active = isRouteActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-colors duration-150 group',
                      active
                        ? 'bg-[#047857] text-white font-semibold'
                        : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
                    )}
                    title={item.label}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0',
                          active
                            ? 'text-white'
                            : 'text-[#6B7280] group-hover:text-[#111827]'
                        )}
                      />
                      <span className="hidden xl:inline text-[13px] whitespace-nowrap truncate">
                        {item.label}
                      </span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          'hidden xl:inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-medium tabular-nums',
                          active
                            ? 'bg-white/20 text-white'
                            : 'text-[#6B7280]'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Section 2: Pilotage */}
          <div>
            <div className="hidden xl:block px-3 mb-1.5 text-xs font-medium text-[#6B7280]">
              Pilotage
            </div>
            <nav className="space-y-0.5">
              {NAV_SYSTEME.map((item) => {
                const active = isRouteActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors duration-150 group',
                      active
                        ? 'bg-[#047857] text-white font-semibold'
                        : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
                    )}
                    title={item.label}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        active
                          ? 'text-white'
                          : 'text-[#6B7280] group-hover:text-[#111827]'
                      )}
                    />
                    <span className="hidden xl:inline text-[13px] whitespace-nowrap truncate">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom User Card */}
      <div className="p-3 border-t border-[#E4E7EC] flex items-center justify-between gap-1">
        <Link
          href="/parametres"
          className="flex items-center p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors xl:gap-2.5 group min-w-0 flex-1"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              size="sm"
              src={profile.avatarUrl}
              alt={profile.name}
              initials={
                profile.name
                  .trim()
                  .split(/\s+/)
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'VC'
              }
            />
            <div className="hidden xl:block min-w-0">
              <div className="font-semibold text-[13px] text-[#111827] truncate leading-tight">
                {profile.name}
              </div>
              <div className="text-[11px] text-[#6B7280] truncate mt-0.5">
                {profile.role}
              </div>
            </div>
          </div>
        </Link>
        <button
          type="button"
          onClick={signOut}
          title="Se déconnecter"
          aria-label="Se déconnecter"
          className="hidden xl:flex w-8 h-8 rounded-lg items-center justify-center text-[#6B7280] hover:text-[#E11D48] hover:bg-[#FFF1F2] transition-colors shrink-0 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
