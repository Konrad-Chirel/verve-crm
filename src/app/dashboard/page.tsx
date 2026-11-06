'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Clock,
  Check,
  Plus,
  Mail,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { useModal } from '@/context/modal-context';
import { useCRM } from '@/context/crm-context';
import { STAGES } from '@/lib/mock-data';

export default function DashboardPage() {
  const { openNewDeal } = useModal();
  const {
    deals,
    relances,
    activities,
    profile,
    toggleRelance,
    postponeRelance,
    addRelance,
    showToast,
  } = useCRM();

  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [relanceFilter, setRelanceFilter] = useState<'all' | 'pending'>('all');
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);

  // Add Follow-up inline state
  const [newRelanceContact, setNewRelanceContact] = useState('');
  const [newRelanceCompany, setNewRelanceCompany] = useState('');
  const [newRelanceTime, setNewRelanceTime] = useState('16:00');
  const [newRelanceTitle, setNewRelanceTitle] = useState('');

  // Dynamic KPI computations from live deals state
  const wonDeals = deals.filter((d) => d.stageId === 'won');
  const signedAmountBase = wonDeals.reduce((sum, d) => sum + d.amount, 0);

  const negotiationDeals = deals.filter(
    (d) => d.stageId === 'negotiation' || d.stageId === 'proposal'
  );
  const negotiationAmount = negotiationDeals.reduce((sum, d) => sum + d.amount, 0);
  const negotiationWeighted = Math.round(
    negotiationDeals.reduce((sum, d) => sum + (d.amount * d.probability) / 100, 0)
  );

  const periodMultiplier = selectedPeriod === 'month' ? 1 : selectedPeriod === 'quarter' ? 2.8 : 9.5;
  const displayedSigned = Math.round(signedAmountBase * periodMultiplier);
  const displayedTarget =
    selectedPeriod === 'month'
      ? profile.monthlyTarget
      : selectedPeriod === 'quarter'
      ? profile.quarterlyTarget
      : profile.quarterlyTarget * 3.5;
  const targetPct = Math.min(100, Math.round((displayedSigned / Math.max(1, displayedTarget)) * 100));

  const pendingRelances = relances.filter((r) => !r.done);
  const pendingClosingPotential = pendingRelances.reduce((sum, r) => sum + r.amount, 0);

  const visibleRelances =
    relanceFilter === 'pending' ? pendingRelances : relances;

  // Dynamic Pipeline Breakdown by stage
  const totalPipelineVolume = deals.reduce((sum, d) => sum + d.amount, 0);
  const stageBreakdown = STAGES.map((stg, idx) => {
    const stageDeals = deals.filter((d) => d.stageId === stg.id);
    const amount = stageDeals.reduce((sum, d) => sum + d.amount, 0);
    const pct = totalPipelineVolume > 0 ? Math.round((amount / totalPipelineVolume) * 100) : 0;
    const barColors = [
      'bg-[#A7F3D0]',
      'bg-[#34D399]',
      'bg-[#10B981]',
      'bg-[#059669]',
      'bg-[#047857]',
    ];
    return {
      ...stg,
      count: stageDeals.length,
      amount,
      pct,
      barColor: barColors[idx] || 'bg-[#047857]',
    };
  });

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRelanceContact.trim() || !newRelanceCompany.trim()) return;

    const matchedDeal =
      deals.find((d) => d.companyName.toLowerCase() === newRelanceCompany.trim().toLowerCase()) ||
      deals[0];

    addRelance({
      dealId: matchedDeal ? matchedDeal.id : 'deal-lumina',
      timeSlot: newRelanceTime || '16:00',
      timeLabel: 'Aujourd’hui',
      contactName: newRelanceContact.trim(),
      contactRole: 'Décideur',
      companyName: newRelanceCompany.trim(),
      companyInitials: newRelanceCompany.trim().slice(0, 2).toUpperCase(),
      companyColor: 'bg-[#ECFDF5] text-[#047857]',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      dealTitle: newRelanceTitle.trim() || 'Point d’avancement proposition',
      contextLine: 'Suivi programmé manuellement',
      amount: matchedDeal ? matchedDeal.amount : 18000,
      statusTag: 'Suivi planifié',
      actionType: 'call',
      actionLabel: 'Appeler',
    });

    setNewRelanceContact('');
    setNewRelanceCompany('');
    setNewRelanceTitle('');
    setShowAddFollowUp(false);
  };

  return (
    <div className="space-y-8">
      {/* 1. Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#6B7280] mb-1">
            Mardi 24 mars 2026 — {profile.agency}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
            Bonjour, {profile.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-[#4B5563] mt-1.5 max-w-2xl">
            Vous avez {pendingRelances.length} suivis inscrits à l’agenda aujourd’hui pour{' '}
            {formatCurrency(pendingClosingPotential)} d’honoraires en cours de validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-end">
          <div className="inline-flex items-center p-0.5 bg-white border border-[#E4E7EC] rounded-lg">
            <button
              type="button"
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                selectedPeriod === 'month'
                  ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Mars 2026
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('quarter')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                selectedPeriod === 'quarter'
                  ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Trimestre 1
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('year')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                selectedPeriod === 'year'
                  ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Exercice 2026
            </button>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
            <Link href="/pipeline" className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full sm:w-auto">
                Voir le pipeline ({deals.length})
              </Button>
            </Link>

            <Button variant="primary" size="md" onClick={openNewDeal} className="w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              <span>Ouvrir un dossier</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Unified 3-Column Architectural Ledger (No floating bubble cards or top stripes) */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-[#E4E7EC] grid grid-cols-1 lg:grid-cols-3 shadow-2xs">
        {/* Column 1: Signed Fees */}
        <div className="p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#4B5563]">
                Honoraires signés ({selectedPeriod === 'month' ? 'Mars' : selectedPeriod === 'quarter' ? 'T1' : '2026'})
              </span>
              <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#047857] text-[11px] font-semibold">
                +18% vs fév.
              </span>
            </div>
            <div className="mt-3 font-display text-3xl sm:text-4xl font-bold text-[#111827] tabular-nums tracking-tight">
              {formatCurrency(displayedSigned)}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#F3F4F6] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B7280]">
                Objectif : {formatCurrency(displayedTarget)}
              </span>
              <span className="font-semibold text-[#111827] tabular-nums">{targetPct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#047857] transition-all duration-300"
                style={{ width: `${targetPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Column 2: Active Negotiation */}
        <div className="p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#4B5563]">
                En cours de négociation
              </span>
              <span className="px-2 py-0.5 rounded bg-[#F3F4F6] text-[#4B5563] text-[11px] font-medium">
                {negotiationDeals.length} dossiers actifs
              </span>
            </div>
            <div className="mt-3 font-display text-3xl sm:text-4xl font-bold text-[#111827] tabular-nums tracking-tight">
              {formatCurrency(negotiationAmount)}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
            <span className="text-[#6B7280]">Valeur pondérée prévisionnelle</span>
            <span className="font-display font-bold text-[#047857] tabular-nums">
              {formatCurrency(negotiationWeighted)}
            </span>
          </div>
        </div>

        {/* Column 3: Scheduled Follow-ups */}
        <div className="p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#4B5563]">
                Suivis programmés ce jour
              </span>
              <span className="px-2 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] text-[11px] font-medium">
                Délai moyen 48h
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl sm:text-4xl font-bold text-[#111827] tabular-nums tracking-tight">
                {pendingRelances.length}
              </span>
              <span className="text-sm text-[#6B7280]">échéances avant 18h00</span>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
            <span className="text-[#6B7280]">Prochain appel</span>
            <span className="font-semibold text-[#111827]">
              {pendingRelances[0]
                ? `${pendingRelances[0].timeSlot} — ${pendingRelances[0].companyName}`
                : 'Agenda traité'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Feuille de route du jour (Clean Agenda Sheet) */}
      <section className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-bold text-[#111827]">
              Feuille de route du jour
            </h2>
            <span className="px-2 py-0.5 rounded bg-[#F3F4F6] text-[#4B5563] text-xs font-medium tabular-nums">
              {pendingRelances.length} sur {relances.length} à traiter
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center p-0.5 bg-white border border-[#E4E7EC] rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setRelanceFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  relanceFilter === 'all'
                    ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                Tous ({relances.length})
              </button>
              <button
                type="button"
                onClick={() => setRelanceFilter('pending')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  relanceFilter === 'pending'
                    ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                À traiter ({pendingRelances.length})
              </button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddFollowUp((prev) => !prev)}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Planifier un suivi</span>
            </Button>
          </div>
        </div>

        {/* Inline Form to schedule a new follow-up */}
        {showAddFollowUp && (
          <form
            onSubmit={handleCreateFollowUp}
            className="bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#111827]">
                Nouveau suivi à l’agenda du jour
              </span>
              <button
                type="button"
                onClick={() => setShowAddFollowUp(false)}
                className="text-[#6B7280] hover:text-[#111827]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Input
                placeholder="Interlocuteur (ex: Claire Moreau)"
                value={newRelanceContact}
                onChange={(e) => setNewRelanceContact(e.target.value)}
                required
              />
              <Input
                placeholder="Société (ex: Lumina Studio)"
                value={newRelanceCompany}
                onChange={(e) => setNewRelanceCompany(e.target.value)}
                required
              />
              <Input
                placeholder="Objet (ex: Validation devis v2)"
                value={newRelanceTitle}
                onChange={(e) => setNewRelanceTitle(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={newRelanceTime}
                  onChange={(e) => setNewRelanceTime(e.target.value)}
                  className="w-28"
                />
                <Button type="submit" variant="primary" size="md" className="flex-1">
                  Ajouter
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Unified Agenda Sheet */}
        <div className="bg-white border border-[#E4E7EC] rounded-xl divide-y divide-[#E4E7EC] shadow-2xs overflow-hidden">
          {visibleRelances.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                item.done ? 'bg-[#F9FAFB] opacity-60' : 'hover:bg-[#F9FAFB]/60'
              }`}
            >
              {/* Left: Checkbox + Time + Contact */}
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 lg:w-[36%]">
                <button
                  type="button"
                  onClick={() => toggleRelance(item.id)}
                  aria-label={item.done ? 'Marquer comme à faire' : 'Marquer comme terminé'}
                  className={`mt-0.5 sm:mt-0 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    item.done
                      ? 'bg-[#047857] border-[#047857] text-white'
                      : 'border-[#D0D5DD] hover:border-[#047857] bg-white'
                  }`}
                >
                  {item.done && <Check className="w-3 h-3" />}
                </button>

                <div className="w-[76px] shrink-0">
                  <div className="font-display font-bold text-sm text-[#111827] tabular-nums">
                    {item.timeSlot}
                  </div>
                  <div className="text-[11px] text-[#6B7280] whitespace-nowrap">{item.timeLabel}</div>
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-sm text-[#111827] truncate">
                    {item.contactName}
                  </div>
                  <div className="text-xs text-[#6B7280] truncate">
                    {item.contactRole}, {item.companyName}
                  </div>
                </div>
              </div>

              {/* Middle: Deal & Context */}
              <div className="min-w-0 lg:flex-1">
                <Link
                  href={`/deals/${item.dealId}`}
                  className="font-medium text-sm text-[#111827] hover:text-[#047857] transition-colors block truncate"
                >
                  {item.dealTitle}
                </Link>
                <div className="text-xs text-[#6B7280] truncate mt-0.5">
                  {item.contextLine}
                </div>
              </div>

              {/* Right: Amount + Actions */}
              <div className="flex items-center justify-between lg:justify-end gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#F3F4F6] shrink-0">
                <div className="font-display font-bold text-sm text-[#111827] tabular-nums">
                  {formatCurrency(item.amount)}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => postponeRelance(item.id, '17:30')}
                  >
                    <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>Décaler</span>
                  </Button>

                  {item.actionType === 'email' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        toggleRelance(item.id);
                        showToast(`Message préparé pour ${item.contactName}`);
                      }}
                    >
                      <Mail className="w-3.5 h-3.5 text-[#4B5563]" />
                      <span>Écrire</span>
                    </Button>
                  ) : (
                    <Button
                      variant={item.done ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => toggleRelance(item.id)}
                    >
                      {item.done ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Terminé</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-3.5 h-3.5" />
                          <span>Appeler</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Bottom Analytical Split: Pipeline Distribution + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Pipeline Breakdown */}
        <div className="lg:col-span-7 bg-white border border-[#E4E7EC] rounded-xl p-4 sm:p-6 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-[#111827]">
                  Répartition du pipeline commercial
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Pondération des mandats actifs selon leur avancement contractuel
                </p>
              </div>
              <div className="font-display text-xl font-bold text-[#111827] tabular-nums">
                {formatCurrency(totalPipelineVolume)}
              </div>
            </div>

            {/* Graduated Monochrome Emerald Bar */}
            <div className="h-2.5 w-full rounded-md bg-[#F3F4F6] overflow-hidden flex gap-0.5">
              {stageBreakdown.map((stg) => (
                <div
                  key={stg.id}
                  style={{ width: `${Math.max(4, stg.pct)}%` }}
                  className={`h-full ${stg.barColor} transition-all duration-300`}
                  title={`${stg.name} : ${formatCurrency(stg.amount)} (${stg.pct}%)`}
                />
              ))}
            </div>

            {/* Stage Breakdown Table */}
            <div className="divide-y divide-[#F3F4F6] pt-1">
              {stageBreakdown.map((stg) => (
                <div
                  key={stg.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-xs ${stg.barColor} shrink-0`} />
                    <span className="font-medium text-[#111827] whitespace-nowrap">{stg.name}</span>
                    <span className="hidden sm:inline text-[#6B7280] whitespace-nowrap">
                      ({stg.count} dossiers)
                    </span>
                    <span className="sm:hidden text-[#9CA3AF] tabular-nums">· {stg.count}</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 tabular-nums shrink-0">
                    <span className="text-[#6B7280] w-9 text-right">{stg.pct}%</span>
                    <span className="font-display font-bold text-[#111827] w-[4.5rem] sm:w-24 text-right whitespace-nowrap">
                      {formatCurrency(stg.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E4E7EC] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-[#6B7280]">
              Taux de conversion moyen sur le trimestre : <strong className="text-[#111827]">36,4%</strong>
            </span>
            <Link
              href="/rapports"
              className="font-semibold text-[#047857] hover:underline"
            >
              Consulter le rapport financier
            </Link>
          </div>
        </div>

        {/* Right: Recent Activity Log */}
        <div className="lg:col-span-5 bg-white border border-[#E4E7EC] rounded-xl p-4 sm:p-6 shadow-2xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#111827]">
                Journal d’activité récent
              </h2>
              <span className="text-xs text-[#6B7280]">Temps réel</span>
            </div>

            <div className="divide-y divide-[#F3F4F6]">
              {activities.slice(0, 4).map((act) => (
                <div key={act.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/deals/${act.dealId || 'deal-lumina'}`}
                      className="font-semibold text-xs text-[#111827] hover:text-[#047857] transition-colors truncate"
                    >
                      {act.title}
                    </Link>
                    <span className="text-[11px] text-[#6B7280] shrink-0 tabular-nums">
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B5563] line-clamp-2 leading-relaxed">
                    {act.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E4E7EC]">
            <Link href="/deals/deal-lumina" className="block">
              <Button variant="secondary" size="sm" className="w-full">
                Voir le journal complet des dossiers
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
