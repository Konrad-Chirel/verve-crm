'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  Columns3,
  List,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  GripVertical,
  Move,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STAGES, type StageId } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { useModal } from '@/context/modal-context';
import { useCRM } from '@/context/crm-context';

const CARD_GAP = 10; // px — vertical spacing between cards (also used by the animated drop slot)

export default function PipelinePage() {
  const { openNewDeal } = useModal();
  const {
    deals,
    profile,
    moveDealStage,
    reorderDeals,
    moveDealPriority,
    showToast,
  } = useCRM();

  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'high' | 'hot'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [sortBy, setSortBy] = useState<'manual' | 'amount' | 'probability'>('manual');
  // Mobile only: one stage at a time (the five stacked columns made the page endless).
  const [mobileStage, setMobileStage] = useState<StageId>(STAGES[0].id);

  // ---- Drag & drop state -------------------------------------------------
  // `draggedDealId` hides the source card (set one tick after dragstart so the
  // browser can still snapshot it). `dropStageId` / `dropIndex` describe the
  // slot currently opened under the pointer (index among the visible cards of
  // that column, the dragged card excluded).
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragHeight, setDragHeight] = useState(96);
  const [dropStageId, setDropStageId] = useState<StageId | null>(null);
  const [dropIndex, setDropIndex] = useState<number>(0);

  const dragIdRef = useRef<string | null>(null);
  const dropRef = useRef<{ stageId: StageId; index: number } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const resetDrag = () => {
    dragIdRef.current = null;
    dropRef.current = null;
    setDraggedDealId(null);
    setDropStageId(null);
    setDropIndex(0);
  };

  // Safety net: whatever happens (drop outside, Escape, tab switch), clear the drag state.
  useEffect(() => {
    window.addEventListener('dragend', resetDrag);
    window.addEventListener('drop', resetDrag);
    return () => {
      window.removeEventListener('dragend', resetDrag);
      window.removeEventListener('drop', resetDrag);
    };
  }, []);

  const filteredDeals = deals
    .filter((deal) => {
      if (activeFilter === 'high' && deal.amount < 20000) return false;
      if (activeFilter === 'hot' && deal.probability < 60) return false;
      if (activeFilter === 'mine' && deal.probability < 50) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          deal.title.toLowerCase().includes(q) ||
          deal.companyName.toLowerCase().includes(q) ||
          deal.contactName.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'manual') return 0; // preserve user-defined priority order
      if (sortBy === 'amount') return b.amount - a.amount;
      return b.probability - a.probability;
    });

  const totalBrut = filteredDeals.reduce((acc, d) => acc + d.amount, 0);
  const totalWeighted = Math.round(
    filteredDeals.reduce((acc, d) => acc + (d.amount * d.probability) / 100, 0)
  );

  const stepStage = (dealId: string, currentStageId: StageId, dir: -1 | 1) => {
    const idx = STAGES.findIndex((s) => s.id === currentStageId);
    const nextIdx = idx + dir;
    if (nextIdx >= 0 && nextIdx < STAGES.length) {
      moveDealStage(dealId, STAGES[nextIdx].id);
      showToast(`Dossier déplacé vers ${STAGES[nextIdx].name}`);
    }
  };

  // ---- Drag handlers -----------------------------------------------------
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, dealId: string) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();

    e.dataTransfer.setData('text/plain', dealId);
    e.dataTransfer.effectAllowed = 'move';

    // Custom drag image: a slightly tilted, elevated copy of the card (Trello-like).
    const ghost = el.cloneNode(true) as HTMLElement;
    ghost.style.cssText = [
      'position:fixed',
      'top:-9999px',
      'left:-9999px',
      `width:${rect.width}px`,
      'transform:rotate(2.5deg)',
      'box-shadow:0 18px 40px rgba(16,24,40,0.22)',
      'border-radius:12px',
      'background:#fff',
      'pointer-events:none',
    ].join(';');
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, e.clientX - rect.left, e.clientY - rect.top);
    setTimeout(() => ghost.remove(), 0);

    dragIdRef.current = dealId;
    setDragHeight(Math.round(rect.height));
    // Hide the source one tick later: hiding synchronously can cancel the drag in Chromium.
    setTimeout(() => {
      if (dragIdRef.current === dealId) setDraggedDealId(dealId);
    }, 0);
  };

  const autoScrollTrack = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const edge = 80;
    if (clientX < rect.left + edge) track.scrollLeft -= 18;
    else if (clientX > rect.right - edge) track.scrollLeft += 18;
  };

  const handleColumnDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    stageId: StageId,
    visibleCount: number
  ) => {
    if (!dragIdRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    autoScrollTrack(e.clientX);

    // Insertion index = number of cards (dragged one excluded) whose midpoint is above the pointer.
    let index = visibleCount;
    if (sortBy === 'manual') {
      index = 0;
      const cards = e.currentTarget.querySelectorAll<HTMLElement>('[data-deal-id]');
      for (const card of Array.from(cards)) {
        if (card.dataset.dealId === dragIdRef.current) continue;
        const r = card.getBoundingClientRect();
        if (e.clientY > r.top + r.height / 2) index++;
        else break;
      }
    }

    const prev = dropRef.current;
    if (!prev || prev.stageId !== stageId || prev.index !== index) {
      dropRef.current = { stageId, index };
      setDropStageId(stageId);
      setDropIndex(index);
    }
  };

  const handleColumnDrop = (e: React.DragEvent<HTMLDivElement>, stageId: StageId) => {
    e.preventDefault();
    const dealId = dragIdRef.current || e.dataTransfer.getData('text/plain');
    const target = dropRef.current;
    const dragged = deals.find((d) => d.id === dealId);

    if (dealId && dragged && target && target.stageId === stageId) {
      const column = filteredDeals.filter((d) => d.stageId === stageId);
      const others = column.filter((d) => d.id !== dealId);
      const originalIndex = column.findIndex((d) => d.id === dealId);
      const sameSlot = dragged.stageId === stageId && originalIndex === target.index;
      const sameColumnAutoSorted = dragged.stageId === stageId && sortBy !== 'manual';

      if (!sameSlot && !sameColumnAutoSorted) {
        if (target.index < others.length) {
          reorderDeals(dealId, others[target.index].id, 'before', stageId);
        } else if (others.length > 0) {
          reorderDeals(dealId, others[others.length - 1].id, 'after', stageId);
        } else {
          reorderDeals(dealId, null, 'after', stageId);
        }
      }
    }
    resetDrag();
  };

  // ---- Reusable animated drop slot --------------------------------------
  // NB: a plain render function (not a component) so the DOM node stays mounted
  // and the height transition really animates when the active slot changes.
  const renderSlot = (active: boolean, key?: string) => (
    <div
      key={key}
      aria-hidden
      className="overflow-hidden transition-[height] duration-200 ease-out"
      style={{ height: active ? dragHeight + CARD_GAP : 0 }}
    >
      <div
        className={`rounded-xl border-2 border-dashed border-[#047857]/50 bg-[#ECFDF5] flex items-center justify-center text-[11px] font-semibold text-[#047857] transition-opacity duration-200 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ height: dragHeight }}
      >
        Déposer ici
      </div>
    </div>
  );

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* 1. Header & Consolidated Financial Strip */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#6B7280] mb-1">
            Portefeuille actif — {profile.agency}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111827] tracking-tight">
            Pipeline commercial
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-[#047857] shrink-0" />
            <span>Glissez-déposez une carte pour ajuster sa priorité ou changer d’étape</span>
          </p>
        </div>

        {/* Consolidated Financial Strip */}
        <div className="grid grid-cols-3 divide-x divide-[#E4E7EC] bg-white border border-[#E4E7EC] rounded-xl overflow-hidden shadow-2xs self-start lg:self-auto">
          <div className="px-3 sm:px-4 lg:px-5 py-2.5">
            <div className="text-[11px] font-medium text-[#6B7280]">Volume brut</div>
            <div className="font-display text-sm sm:text-base lg:text-lg font-bold text-[#111827] tabular-nums mt-0.5">
              {formatCurrency(totalBrut)}
            </div>
          </div>
          <div className="px-3 sm:px-4 lg:px-5 py-2.5">
            <div className="text-[11px] font-medium text-[#6B7280]">Pondéré</div>
            <div className="font-display text-sm sm:text-base lg:text-lg font-bold text-[#047857] tabular-nums mt-0.5">
              {formatCurrency(totalWeighted)}
            </div>
          </div>
          <div className="px-3 sm:px-4 lg:px-5 py-2.5">
            <div className="text-[11px] font-medium text-[#6B7280]">Cycle moyen</div>
            <div className="font-display text-sm sm:text-base lg:text-lg font-bold text-[#111827] tabular-nums mt-0.5">
              18 jours
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter & View Controls */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 bg-white border border-[#E4E7EC] rounded-lg overflow-x-auto self-start max-w-full">
          {(
            [
              ['all', `Tous les dossiers (${deals.length})`],
              ['mine', 'Mes mandats'],
              ['high', 'Supérieur à 20 k€'],
              ['hot', 'Prioritaires (≥60%)'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === key
                  ? 'bg-[#047857] text-white font-semibold'
                  : 'text-[#4B5563] hover:text-[#111827]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-56 min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer par société, mission..."
              className="w-full h-9 pl-8 pr-3 bg-white rounded-lg text-xs text-[#111827] placeholder:text-[#9CA3AF] border border-[#E4E7EC] focus:border-[#047857] outline-none transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setSortBy((prev) =>
                prev === 'manual' ? 'amount' : prev === 'amount' ? 'probability' : 'manual'
              )
            }
            className="h-9 px-3 rounded-lg bg-white hover:bg-[#F9FAFB] border border-[#E4E7EC] text-xs font-medium text-[#4B5563] hover:text-[#111827] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Changer le mode de classement"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>
              Tri :{' '}
              {sortBy === 'manual'
                ? 'Priorité libre'
                : sortBy === 'amount'
                ? 'Montant HT'
                : 'Probabilité'}
            </span>
          </button>

          <div className="inline-flex items-center p-0.5 bg-white border border-[#E4E7EC] rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Colonnes</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Registre</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Kanban board. Mobile: stacked. md+: one row of 5 readable columns;
          it only scrolls sideways when the window is too narrow for 5 columns. */}
      {viewMode === 'kanban' ? (
        <div className="space-y-3 md:space-y-0">
        {/* Mobile stage switcher: one stage at a time */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2 w-max">
            {STAGES.map((stage) => {
              const count = filteredDeals.filter((d) => d.stageId === stage.id).length;
              const active = mobileStage === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setMobileStage(stage.id)}
                  className={`shrink-0 inline-flex items-center gap-2 px-3 h-9 rounded-lg border text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#047857] border-[#047857] text-white'
                      : 'bg-white border-[#E4E7EC] text-[#4B5563]'
                  }`}
                >
                  <span>{stage.name}</span>
                  <span
                    className={`min-w-5 h-5 px-1 rounded-md text-[11px] tabular-nums flex items-center justify-center ${
                      active ? 'bg-white/20 text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          ref={trackRef}
          className="grid grid-cols-1 gap-3 md:grid-cols-none md:grid-flow-col md:auto-cols-[minmax(252px,1fr)] md:items-start md:overflow-x-auto md:p-1 md:-m-1 md:pb-3"
        >
          {STAGES.map((stage, stageIdx) => {
            const stageDeals = filteredDeals.filter((d) => d.stageId === stage.id);
            const stageAmount = stageDeals.reduce((sum, d) => sum + d.amount, 0);
            const visibleDeals = stageDeals.filter((d) => d.id !== draggedDealId);
            const isDropColumn = dropStageId === stage.id && draggedDealId !== null;
            let slotCursor = 0;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleColumnDragOver(e, stage.id, visibleDeals.length)}
                onDrop={(e) => handleColumnDrop(e, stage.id)}
                className={`min-w-0 border rounded-xl p-3 flex-col gap-3 min-h-[420px] transition-colors duration-150 md:flex ${
                  mobileStage === stage.id ? 'flex' : 'hidden'
                } ${
                  isDropColumn
                    ? 'bg-[#F3FAF6] border-[#047857]/60'
                    : 'bg-[#F1F3F2] border-[#E4E7EC]'
                }`}
              >
                {/* Column Header */}
                <div className="px-1 pt-0.5 pb-2 border-b border-[#E4E7EC] flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-xs shrink-0 ${stage.dotColor}`} />
                    <h2 className="font-display font-bold text-sm text-[#111827] truncate">
                      {stage.name}
                    </h2>
                    <span className="text-xs font-medium text-[#6B7280] tabular-nums shrink-0">
                      {visibleDeals.length}
                    </span>
                  </div>
                  <span className="font-display font-bold text-xs text-[#111827] tabular-nums shrink-0">
                    {formatCurrency(stageAmount)}
                  </span>
                </div>

                {/* Cards, separated by animated drop slots */}
                <div className="flex-1 flex flex-col">
                  {stageDeals.map((deal, dealIdx) => {
                    const isDragged = draggedDealId === deal.id;

                    // The source card stays mounted (so dragend still fires and the drag is never
                    // cancelled) but is collapsed to zero height while it is being dragged.
                    const slotIndex = isDragged ? -1 : slotCursor++;
                    const isUrgent = deal.badgeType === 'urgent';

                    return (
                      <React.Fragment key={deal.id}>
                        {!isDragged && renderSlot(isDropColumn && dropIndex === slotIndex)}

                        <div
                          data-deal-id={deal.id}
                          aria-hidden={isDragged || undefined}
                          style={
                            isDragged
                              ? { height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }
                              : { paddingBottom: CARD_GAP }
                          }
                        >
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, deal.id)}
                            onDragEnd={resetDrag}
                            className="bg-white rounded-xl p-3.5 border border-[#E4E7EC] hover:border-[#047857]/50 hover:shadow-sm transition-[border-color,box-shadow] duration-150 flex flex-col gap-3 cursor-grab active:cursor-grabbing select-none min-w-0"
                          >
                            {/* Top row */}
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <GripVertical className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                                <Link
                                  href={`/deals/${deal.id}`}
                                  draggable={false}
                                  className="flex items-center gap-2 min-w-0 group"
                                >
                                  <div className="w-6 h-6 rounded-md bg-[#F3F4F6] text-[#111827] border border-[#E4E7EC] flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {deal.companyInitials}
                                  </div>
                                  <span className="text-[13px] font-semibold text-[#111827] group-hover:text-[#047857] transition-colors truncate">
                                    {deal.companyName}
                                  </span>
                                </Link>
                              </div>
                              <span className="px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#4B5563] text-[11px] font-semibold tabular-nums shrink-0">
                                {deal.probability}%
                              </span>
                            </div>

                            {/* Title & contact */}
                            <Link
                              href={`/deals/${deal.id}`}
                              draggable={false}
                              className="block space-y-1 group min-w-0"
                            >
                              {isUrgent && (
                                <span className="inline-block px-2 py-0.5 rounded bg-[#FFF1F2] text-[#BE123C] text-[10px] font-semibold">
                                  Relance ce jour
                                </span>
                              )}
                              <h3 className="font-display font-bold text-[15px] text-[#111827] group-hover:text-[#047857] leading-snug transition-colors">
                                {deal.title}
                              </h3>
                              <p className="text-xs text-[#6B7280] leading-snug">
                                {deal.contactName}
                                {deal.contactRole ? (
                                  <span className="text-[#9CA3AF]"> · {deal.contactRole}</span>
                                ) : null}
                              </p>
                            </Link>

                            {/* Amount + next action + priority stepper */}
                            <div className="pt-2.5 border-t border-[#F3F4F6] flex items-center justify-between gap-2">
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <div className="font-display font-bold text-base text-[#111827] tabular-nums">
                                  {formatCurrency(deal.amount)}
                                </div>
                                <div className="text-xs text-[#6B7280] flex items-center gap-1.5 leading-snug">
                                  <Clock className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                                  <span className="truncate">{deal.nextAction}</span>
                                </div>
                              </div>

                              {/* Priority stepper (accessible alternative to drag-and-drop) */}
                              <div className="flex flex-col items-center shrink-0 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md overflow-hidden">
                                <button
                                  type="button"
                                  disabled={dealIdx === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveDealPriority(deal.id, 'up');
                                    if (sortBy !== 'manual') setSortBy('manual');
                                  }}
                                  className="p-1 hover:text-[#047857] hover:bg-white text-[#9CA3AF] disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                                  title="Monter en priorité"
                                  aria-label="Monter en priorité"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <div className="w-full h-px bg-[#E5E7EB]" />
                                <button
                                  type="button"
                                  disabled={dealIdx === stageDeals.length - 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveDealPriority(deal.id, 'down');
                                    if (sortBy !== 'manual') setSortBy('manual');
                                  }}
                                  className="p-1 hover:text-[#047857] hover:bg-white text-[#9CA3AF] disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                                  title="Descendre en priorité"
                                  aria-label="Descendre en priorité"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Quick stage controls & open */}
                            <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between gap-1">
                              <button
                                type="button"
                                disabled={stageIdx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  stepStage(deal.id, deal.stageId, -1);
                                }}
                                className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-[11px] font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer shrink-0"
                                title="Étape précédente"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>Reculer</span>
                              </button>

                              <Link
                                href={`/deals/${deal.id}`}
                                draggable={false}
                                className="px-2 py-1 rounded-md text-[11px] font-semibold text-[#047857] hover:text-[#065F46] hover:bg-[#ECFDF5] transition-colors shrink-0 text-center"
                              >
                                Ouvrir
                              </Link>

                              <button
                                type="button"
                                disabled={stageIdx === STAGES.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  stepStage(deal.id, deal.stageId, 1);
                                }}
                                className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-[11px] font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer shrink-0"
                                title="Étape suivante"
                              >
                                <span>Avancer</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}

                  {/* Trailing slot = "drop at the end of the column" */}
                  {renderSlot(isDropColumn && dropIndex === slotCursor, 'end-slot')}

                  {visibleDeals.length === 0 && !isDropColumn && (
                    <div className="py-10 text-center text-xs text-[#9CA3AF] border border-dashed border-[#D0D5DD] rounded-xl bg-white/50">
                      Aucun dossier à cette étape
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={openNewDeal}
                    className="mt-1 w-full py-2.5 px-3 rounded-lg border border-dashed border-[#D0D5DD] hover:border-[#047857] text-[#6B7280] hover:text-[#047857] hover:bg-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un dossier</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      ) : (
        /* List / Registry Table View */
        <div className="bg-white border border-[#E4E7EC] rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E4E7EC] bg-[#F9FAFB] text-xs font-semibold text-[#4B5563]">
                  <th className="px-6 py-3.5">Mission &amp; Société</th>
                  <th className="px-6 py-3.5">Interlocuteur</th>
                  <th className="px-6 py-3.5">Étape (modifier)</th>
                  <th className="px-6 py-3.5 text-right">Probabilité</th>
                  <th className="px-6 py-3.5 text-right">Honoraires HT</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] text-xs">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/deals/${deal.id}`}
                        className="font-display font-bold text-sm text-[#111827] hover:text-[#047857] block"
                      >
                        {deal.title}
                      </Link>
                      <span className="text-xs text-[#6B7280]">{deal.companyName}</span>
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      <div className="font-semibold text-[#111827]">{deal.contactName}</div>
                      <div className="text-xs text-[#6B7280]">{deal.contactRole}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={deal.stageId}
                        onChange={(e) => moveDealStage(deal.id, e.target.value as StageId)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-[#111827] border border-[#E4E7EC] focus:border-[#047857] outline-none cursor-pointer"
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right font-display font-bold text-[#047857] tabular-nums">
                      {deal.probability}%
                    </td>
                    <td className="px-6 py-4 text-right font-display font-bold text-sm text-[#111827] tabular-nums">
                      {formatCurrency(deal.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/deals/${deal.id}`}>
                        <Button variant="secondary" size="sm">
                          Ouvrir
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
