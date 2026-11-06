'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ArrowUpRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCRM } from '@/context/crm-context';
import { formatCurrency } from '@/lib/utils';
import { STAGES } from '@/lib/mock-data';
import { FinancialChart, type MonthlyDataPoint } from '@/components/rapports/financial-chart';

export default function RapportsPage() {
  const { deals, profile, showToast } = useCRM();
  const [period, setPeriod] = useState<'q1' | 's1' | 'year'>('q1');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const multiplier = period === 'q1' ? 1 : period === 's1' ? 1.85 : 3.6;

  const wonDeals = deals.filter((d) => d.stageId === 'won');
  const wonBase = wonDeals.reduce((sum, d) => sum + d.amount, 0);
  const totalBrutBase = deals.reduce((sum, d) => sum + d.amount, 0);
  const avgDealSize = deals.length > 0 ? Math.round(totalBrutBase / deals.length) : 0;

  const signedDisplay = Math.round((wonBase + 92500) * multiplier);
  const targetDisplay = Math.round(profile.quarterlyTarget * multiplier);
  const targetPct = Math.min(100, Math.round((signedDisplay / Math.max(1, targetDisplay)) * 100));

  // Dynamic monthly dataset scaling with the selected period
  const MONTHLY_DATA: MonthlyDataPoint[] = [
    {
      month: 'Oct. 25',
      label: 'Octobre 2025',
      signed: Math.round(28000 * multiplier),
      weighted: Math.round(36000 * multiplier),
      dealsCount: 2,
      growth: '+12%',
    },
    {
      month: 'Nov. 25',
      label: 'Novembre 2025',
      signed: Math.round(42000 * multiplier),
      weighted: Math.round(50000 * multiplier),
      dealsCount: 3,
      growth: '+50%',
    },
    {
      month: 'Déc. 25',
      label: 'Décembre 2025',
      signed: Math.round(55000 * multiplier),
      weighted: Math.round(60000 * multiplier),
      dealsCount: 3,
      growth: '+31%',
    },
    {
      month: 'Janv. 26',
      label: 'Janvier 2026',
      signed: Math.round(38000 * multiplier),
      weighted: Math.round(48000 * multiplier),
      dealsCount: 2,
      growth: '-31%',
    },
    {
      month: 'Févr. 26',
      label: 'Février 2026',
      signed: Math.round(62000 * multiplier),
      weighted: Math.round(65000 * multiplier),
      dealsCount: 4,
      growth: '+63%',
    },
    {
      month: 'Mars 26',
      label: 'Mars 2026 (En cours)',
      signed: Math.round(wonBase * multiplier),
      weighted: Math.round(68000 * multiplier),
      dealsCount: wonDeals.length || 2,
      growth: '+18%',
    },
  ];

  const handleExportReport = () => {
    const headers = [
      'Mandat',
      'Societe',
      'Etape',
      'Honoraires HT (EUR)',
      'Probabilite (%)',
      'Valeur Ponderee (EUR)',
      'Echeance',
    ];
    const rows = deals.map((d) => {
      const stgName = STAGES.find((s) => s.id === d.stageId)?.name || d.stageId;
      const weighted = Math.round((d.amount * d.probability) / 100);
      return [
        `"${d.title.replace(/"/g, '""')}"`,
        `"${d.companyName.replace(/"/g, '""')}"`,
        `"${stgName}"`,
        d.amount,
        d.probability,
        weighted,
        `"${d.nextActionDate || 'Mars 2026'}"`,
      ];
    });

    const csv = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-financier-verve-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Rapport financier CSV exporté');
  };

  // Filter or highlight top deals according to selection
  const sortedDeals = [...deals].sort(
    (a, b) => b.amount * b.probability - a.amount * a.probability
  );

  return (
    <div className="space-y-8">
      {/* 1. Header with Period Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#6B7280] mb-1">
            Pilotage financier — {profile.agency}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
            Trésorerie &amp; Flux
          </h1>
          <p className="text-sm text-[#4B5563] mt-1">
            Analyse consolidée de la facturation engagée et de l’encours pondéré
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center p-0.5 bg-white border border-[#E4E7EC] rounded-lg">
            <button
              type="button"
              onClick={() => {
                setPeriod('q1');
                setSelectedMonth(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                period === 'q1'
                  ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              T1 2026
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriod('s1');
                setSelectedMonth(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                period === 's1'
                  ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Semestre 1
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriod('year');
                setSelectedMonth(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                period === 'year'
                  ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Exercice 2026
            </button>
          </div>

          <Button variant="primary" size="md" onClick={handleExportReport} className="w-full sm:w-auto">
            <Download className="w-4 h-4" />
            <span>Exporter le rapport CSV</span>
          </Button>
        </div>
      </div>

      {/* 2. Unified 3-Column Financial Strip */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl divide-y md:divide-y-0 md:divide-x divide-[#E4E7EC] grid grid-cols-1 md:grid-cols-3 shadow-2xs">
        <div className="p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-[#4B5563]">
              Honoraires signés cumulés ({period === 'q1' ? 'T1' : period === 's1' ? 'S1' : 'Annuel'})
            </span>
            <div className="mt-3 font-display text-3xl sm:text-4xl font-bold text-[#111827] tabular-nums tracking-tight">
              {formatCurrency(signedDisplay)}
            </div>
          </div>
          <div className="mt-5 pt-3.5 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#047857]">+24% vs N-1</span>
            <span className="text-[#6B7280]">
              Cible : {formatCurrency(targetDisplay)} ({targetPct}%)
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-[#4B5563]">
              Honoraires moyens par mandat
            </span>
            <div className="mt-3 font-display text-3xl sm:text-4xl font-bold text-[#111827] tabular-nums tracking-tight">
              {formatCurrency(avgDealSize)}
            </div>
          </div>
          <div className="mt-5 pt-3.5 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
            <span className="text-[#6B7280]">Sur {deals.length} dossiers actifs</span>
            <span className="font-medium text-[#111827]">Durée moy. 8 semaines</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-[#4B5563]">
              Délai moyen de signature
            </span>
            <div className="mt-3 font-display text-3xl sm:text-4xl font-bold text-[#111827] tabular-nums tracking-tight">
              18 jours
            </div>
          </div>
          <div className="mt-5 pt-3.5 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#047857]">-4 jours vs trimestre préc.</span>
            <span className="text-[#6B7280]">Conversion : 42,8%</span>
          </div>
        </div>
      </div>

      {/* 3. New Dynamic & Interactive Financial Chart */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-2xs p-4 sm:p-6 space-y-6">
        <FinancialChart
          data={MONTHLY_DATA}
          monthlyTarget={Math.round(profile.monthlyTarget * (period === 'q1' ? 1 : period === 's1' ? 1.85 : 3.6))}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
        />

        {/* Top Weighted Deals Table */}
        <div className="pt-2 border-t border-[#E4E7EC] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs text-[#111827]">
                Principaux mandats contribuant au prévisionnel
              </h3>
              {selectedMonth && (
                <span className="text-xs text-[#047857] font-medium">
                  — Focus sur {selectedMonth}
                </span>
              )}
            </div>
            <Link
              href="/pipeline"
              className="text-xs font-semibold text-[#047857] hover:underline flex items-center gap-1"
            >
              <span>Voir tout le pipeline</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedDeals.slice(0, 6).map((d) => {
              const weighted = Math.round((d.amount * d.probability) / 100);
              return (
                <Link
                  key={d.id}
                  href={`/deals/${d.id}`}
                  className="p-3.5 rounded-lg bg-[#F9FAFB] hover:bg-white border border-[#E4E7EC] hover:border-[#047857]/50 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-[#111827] group-hover:text-[#047857] transition-colors truncate">
                      {d.companyName}
                    </div>
                    <div className="text-xs text-[#6B7280] truncate mt-0.5">
                      {d.title}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-bold text-sm text-[#047857] tabular-nums">
                      {formatCurrency(weighted)}
                    </div>
                    <div className="text-[11px] text-[#6B7280] tabular-nums">
                      {d.probability}% de {formatCurrency(d.amount)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
