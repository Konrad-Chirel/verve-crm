'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Kanban, Building2, LayoutDashboard, ArrowRight, Plus } from 'lucide-react';
import { useModal } from '@/context/modal-context';
import { useCRM } from '@/context/crm-context';
import { formatCurrency } from '@/lib/utils';
import { StageChip } from '@/components/ui/stage-chip';

export function CommandPalette() {
  const { isCommandPaletteOpen, closeCommandPalette, openNewDeal } = useModal();
  const { deals, companies } = useCRM();
  const [query, setQuery] = useState('');
  const router = useRouter();

  if (!isCommandPaletteOpen) return null;

  const filteredDeals = query.trim()
    ? deals.filter(
        (d) =>
          d.title.toLowerCase().includes(query.toLowerCase()) ||
          d.companyName.toLowerCase().includes(query.toLowerCase()) ||
          d.contactName.toLowerCase().includes(query.toLowerCase())
      )
    : deals.slice(0, 5);

  const filteredCompanies = query.trim()
    ? companies.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.sector.toLowerCase().includes(query.toLowerCase()) ||
          c.city.toLowerCase().includes(query.toLowerCase())
      )
    : companies.slice(0, 4);

  const handleSelectDeal = (id: string) => {
    closeCommandPalette();
    router.push(`/deals/${id}`);
  };

  const handleSelectCompany = (dealId: string) => {
    closeCommandPalette();
    router.push(`/deals/${dealId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-[#111827]/40 backdrop-blur-[2px]">
      <div
        className="fixed inset-0"
        onClick={closeCommandPalette}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-xl border border-[#E4E7EC] overflow-hidden z-10">
        <div className="flex items-center px-4 py-3.5 border-b border-[#E4E7EC] gap-3">
          <Search className="w-4 h-4 text-[#6B7280] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un dossier, une société ou un interlocuteur..."
            className="w-full bg-transparent text-[#111827] placeholder:text-[#9CA3AF] text-sm outline-none"
          />
          <button
            type="button"
            onClick={closeCommandPalette}
            className="w-6 h-6 rounded-md hover:bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:text-[#111827] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto p-3 space-y-4">
          {!query && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Accès rapide
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    closeCommandPalette();
                    openNewDeal();
                  }}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#047857] bg-[#ECFDF5]/60 hover:bg-[#ECFDF5] border border-[#A7F3D0]/70 transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nouveau dossier commercial
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeCommandPalette();
                    router.push('/pipeline');
                  }}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-text-primary bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-border-base transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <Kanban className="w-4 h-4 text-[#047857]" />
                    Pipeline commercial ({deals.length})
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Mandats actifs ({filteredDeals.length})
            </div>
            {filteredDeals.length === 0 ? (
              <div className="px-3 py-4 text-xs text-text-muted text-center">
                Aucun dossier correspondant à « {query} »
              </div>
            ) : (
              <div className="space-y-1 mt-1">
                {filteredDeals.map((deal) => (
                  <button
                    key={deal.id}
                    type="button"
                    onClick={() => handleSelectDeal(deal.id)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors text-left group"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="font-display font-bold text-xs sm:text-sm text-text-primary truncate group-hover:text-[#047857] transition-colors">
                        {deal.title}
                      </div>
                      <div className="text-xs text-text-secondary truncate">
                        {deal.companyName} — {deal.contactName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <StageChip stageId={deal.stageId} />
                      <span className="font-display font-extrabold text-xs sm:text-sm tabular-nums text-[#047857]">
                        {formatCurrency(deal.amount)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Entreprises ({filteredCompanies.length})
            </div>
            <div className="space-y-1 mt-1">
              {filteredCompanies.map((comp) => (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => handleSelectCompany(comp.primaryDealId)}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl hover:bg-[#F8FAFC] transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${comp.color}`}
                    >
                      {comp.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-bold text-xs sm:text-sm text-text-primary truncate">
                        {comp.name}
                      </div>
                      <div className="text-xs text-text-secondary truncate">
                        {comp.sector} • {comp.city}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-text-secondary shrink-0">
                    {formatCurrency(comp.cumulativeValue)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-2.5 bg-[#F8FAFC] border-t border-border-base flex items-center justify-between text-xs text-text-secondary">
          <span>
            Appuyez sur{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-border-base font-bold text-[10px]">
              Échap
            </kbd>{' '}
            pour fermer
          </span>
          <span className="font-semibold text-[#047857]">Recherche globale Verve</span>
        </div>
      </div>
    </div>
  );
}
