'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Plus,
  CheckCheck,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/lib/brand';
import { useModal } from '@/context/modal-context';
import { useCRM } from '@/context/crm-context';
import { formatCurrency } from '@/lib/utils';

export function Topbar() {
  const { openNewDeal, openCommandPalette } = useModal();
  const { deals, profile, notifications, markAllNotificationsRead } = useCRM();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const totalWeighted = Math.round(
    deals.reduce((sum, d) => sum + (d.amount * d.probability) / 100, 0)
  );
  const q1Pct = Math.min(
    100,
    Math.round((totalWeighted / Math.max(1, profile.quarterlyTarget)) * 100)
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 md:left-[68px] xl:left-60 h-16 bg-white/95 backdrop-blur-md border-b border-[#E4E7EC] z-40">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Left Section: Mobile Brand + Search */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md min-w-0">
          {/* Mobile Logo (< 768px) */}
          <Link href="/dashboard" className="flex md:hidden items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#047857] flex items-center justify-center text-white font-display font-bold text-xs">
              V
            </div>
            <span className="font-display font-bold text-sm text-[#111827] tracking-tight">
              {BRAND.shortName}
            </span>
          </Link>

          {/* Desktop / Tablet Search Bar */}
          <button
            type="button"
            onClick={openCommandPalette}
            className="hidden sm:flex items-center justify-between w-full h-9 px-3 rounded-lg bg-[#F9FAFB] hover:bg-white border border-[#E4E7EC] hover:border-[#D0D5DD] text-[#6B7280] hover:text-[#111827] text-xs transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
              <span className="truncate">Rechercher un dossier, client, contact...</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-white border border-[#E4E7EC] text-[10px] font-medium text-[#6B7280] shrink-0 ml-2">
              ⌘K
            </span>
          </button>
        </div>

        {/* Right Section: Live KPI Summary, Notifications Popover, New Deal CTA */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* Mobile Search Button (< sm) */}
          <button
            type="button"
            onClick={openCommandPalette}
            className="sm:hidden w-8 h-8 rounded-lg bg-[#F9FAFB] border border-[#E4E7EC] flex items-center justify-center text-[#4B5563]"
            aria-label="Rechercher"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Live Weighted Pipeline Metric (≥ lg) */}
          <Link
            href="/pipeline"
            className="hidden lg:flex items-center gap-3 text-xs text-[#4B5563] hover:text-[#111827] transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#047857]" />
              <span>Encours pondéré</span>
              <strong className="font-display font-bold text-[#111827] tabular-nums">
                {formatCurrency(totalWeighted)}
              </strong>
            </span>
            <span className="text-[#E4E7EC]">|</span>
            <span>
              Objectif T1{' '}
              <strong className="font-display font-bold text-[#047857] tabular-nums">
                {q1Pct}%
              </strong>
            </span>
          </Link>

          {/* Interactive Notification Bell + Popover */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              className="relative w-9 h-9 rounded-lg bg-white hover:bg-[#F9FAFB] border border-[#E4E7EC] flex items-center justify-center text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer"
              title="Notifications"
              onClick={() => setNotifOpen((prev) => !prev)}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#047857]" />
              )}
            </button>

            {notifOpen && (
              <div className="fixed left-3 right-3 top-[calc(100%+8px)] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 bg-white rounded-xl shadow-lg border border-[#E4E7EC] overflow-hidden z-50">
                <div className="px-4 py-3 bg-[#F9FAFB] border-b border-[#E4E7EC] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#111827]">
                      Activité &amp; Suivis
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#047857] text-[10px] font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-medium text-[#047857] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Tout marquer lu</span>
                  </button>
                </div>

                <div className="divide-y divide-[#E4E7EC] max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        setNotifOpen(false);
                        router.push(`/deals/${n.dealId}`);
                      }}
                      className="w-full p-3.5 text-left hover:bg-[#F9FAFB] transition-colors flex items-start justify-between gap-3 cursor-pointer"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#047857] shrink-0" />
                          )}
                          <span className="font-semibold text-xs text-[#111827] truncate">
                            {n.title}
                          </span>
                        </div>
                        <p className="text-xs text-[#4B5563] leading-snug">
                          {n.description}
                        </p>
                        <span className="text-[11px] text-[#6B7280] block">{n.time}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile shortcuts (< md): the two menus that don't fit in the bottom bar */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/rapports"
              aria-label="Trésorerie et flux"
              title="Trésorerie & Flux"
              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                pathname.startsWith('/rapports')
                  ? 'bg-[#047857] border-[#047857] text-white'
                  : 'bg-white border-[#E4E7EC] text-[#4B5563]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </Link>
            <Link
              href="/parametres"
              aria-label="Paramètres"
              title="Paramètres"
              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                pathname.startsWith('/parametres')
                  ? 'bg-[#047857] border-[#047857] text-white'
                  : 'bg-white border-[#E4E7EC] text-[#4B5563]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Link>
          </div>

          {/* Primary "+ Nouveau dossier" CTA (tablet/desktop only; mobile uses the bottom-bar +) */}
          <Button variant="primary" size="md" onClick={openNewDeal} className="hidden md:inline-flex">
            <Plus className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Nouveau dossier</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
