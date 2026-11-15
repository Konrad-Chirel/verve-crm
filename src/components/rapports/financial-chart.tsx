'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  SlidersHorizontal,
  Info,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface MonthlyDataPoint {
  month: string;
  label: string;
  signed: number;
  weighted: number;
  dealsCount: number;
  growth: string;
}

interface FinancialChartProps {
  data: MonthlyDataPoint[];
  monthlyTarget: number;
  selectedMonth: string | null;
  onSelectMonth: (month: string | null) => void;
}

export function FinancialChart({
  data,
  monthlyTarget,
  selectedMonth,
  onSelectMonth,
}: FinancialChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showSigned, setShowSigned] = useState(true);
  const [showWeighted, setShowWeighted] = useState(true);
  const [showTargetLine, setShowTargetLine] = useState(true);

  // Compute maximum value for proper dynamic Y-axis scaling
  const maxDataValue = useMemo(() => {
    let max = monthlyTarget;
    data.forEach((d) => {
      if (d.signed > max) max = d.signed;
      if (d.weighted > max) max = d.weighted;
    });
    // Add 15% headroom and round to nearest 10k
    return Math.ceil((max * 1.15) / 10000) * 10000;
  }, [data, monthlyTarget]);

  // Generate 5 nice Y-axis grid tick values
  const yTicks = useMemo(() => {
    const step = maxDataValue / 4;
    return [maxDataValue, step * 3, step * 2, step, 0];
  }, [maxDataValue]);

  // Active or hovered data point
  const activeIndex =
    hoveredIndex !== null
      ? hoveredIndex
      : selectedMonth
      ? data.findIndex((d) => d.month === selectedMonth)
      : data.length - 1; // Default to latest month (Mars 26)

  const activePoint = data[activeIndex] || data[data.length - 1];

  // SVG dimensions for Area Chart
  const svgWidth = 800;
  const svgHeight = 240;
  const paddingX = 40;
  const paddingY = 24;
  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - paddingY * 2;

  // Helper to map (dataIndex, value) to SVG (x, y)
  const getCoords = (index: number, val: number) => {
    const x = paddingX + (index / (data.length - 1)) * usableWidth;
    const y = svgHeight - paddingY - (val / maxDataValue) * usableHeight;
    return { x, y };
  };

  // Generate smooth cubic bezier SVG path
  const generateSmoothPath = (values: number[]) => {
    if (values.length === 0) return '';
    const points = values.map((val, idx) => getCoords(idx, val));

    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const signedPoints = data.map((d) => d.signed);
  const weightedPoints = data.map((d) => d.weighted);

  const signedPath = generateSmoothPath(signedPoints);
  const weightedPath = generateSmoothPath(weightedPoints);

  const signedAreaPath = `${signedPath} L ${svgWidth - paddingX},${svgHeight - paddingY} L ${paddingX},${svgHeight - paddingY} Z`;

  const targetY = svgHeight - paddingY - (monthlyTarget / maxDataValue) * usableHeight;

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar with Chart Type Switcher, Legend Toggles & Month Inspector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E4E7EC]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-[#111827]">
              Évolution des signatures et encours pondérés
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#4B5563] text-xs font-semibold">
              Dynamique
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Survolez ou cliquez sur un mois pour inspecter les métriques détaillées
          </p>
        </div>

        {/* Legend buttons with interactive visibility toggles */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Toggle Signed */}
          <button
            type="button"
            onClick={() => setShowSigned((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
              showSigned
                ? 'bg-white border-[#E4E7EC] text-[#111827] font-semibold shadow-2xs'
                : 'bg-[#F9FAFB] border-transparent text-[#9CA3AF] opacity-60'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-xs transition-colors ${
                showSigned ? 'bg-[#047857]' : 'bg-[#D1D5DB]'
              }`}
            />
            <span>Facturation signée</span>
          </button>

          {/* Toggle Weighted */}
          <button
            type="button"
            onClick={() => setShowWeighted((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
              showWeighted
                ? 'bg-white border-[#E4E7EC] text-[#111827] font-semibold shadow-2xs'
                : 'bg-[#F9FAFB] border-transparent text-[#9CA3AF] opacity-60'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-xs transition-colors ${
                showWeighted ? 'bg-[#10B981] border border-[#059669]' : 'bg-[#D1D5DB]'
              }`}
            />
            <span>Prévisionnel pondéré</span>
          </button>

          {/* Toggle Target Benchmark Line */}
          <button
            type="button"
            onClick={() => setShowTargetLine((prev) => !prev)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
              showTargetLine
                ? 'bg-white border-[#E4E7EC] text-[#111827] font-medium shadow-2xs'
                : 'bg-[#F9FAFB] border-transparent text-[#9CA3AF] opacity-60'
            }`}
            title="Afficher/masquer la ligne d’objectif mensuel"
          >
            <span className="w-3 border-t border-dashed border-[#6B7280]" />
            <span>Objectif ({Math.round(monthlyTarget / 1000)} k€)</span>
          </button>

          {/* Chart Type Toggle: Colonnes / Courbe */}
          <div className="inline-flex items-center p-0.5 bg-[#F3F4F6] border border-[#E4E7EC] rounded-lg ml-auto lg:ml-2">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white text-[#111827] font-semibold shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Colonnes</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white text-[#111827] font-semibold shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Courbe &amp; Aire</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Snapshot Bar (Live Inspector on Hover/Click) */}
      <div className="p-3.5 rounded-lg bg-[#F9FAFB] border border-[#E4E7EC] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#047857]" />
          <span className="text-[#6B7280]">Point d’analyse :</span>
          <strong className="font-semibold text-[#111827] text-[13px]">
            {activePoint.label}
          </strong>
          {selectedMonth && selectedMonth === activePoint.month && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ECFDF5] text-[#047857] text-[11px] font-semibold border border-[#A7F3D0]">
              <CheckCircle2 className="w-3 h-3" />
              Mois sélectionné
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 tabular-nums">
          <div>
            <span className="text-[#6B7280]">Signé : </span>
            <strong className="font-display font-bold text-sm text-[#047857]">
              {formatCurrency(activePoint.signed)}
            </strong>
            <span className="ml-1 text-[11px] font-semibold text-[#047857]">
              ({activePoint.growth})
            </span>
          </div>

          <div>
            <span className="text-[#6B7280]">Pondéré : </span>
            <strong className="font-display font-bold text-sm text-[#111827]">
              {formatCurrency(activePoint.weighted)}
            </strong>
          </div>

          <div className="hidden sm:block">
            <span className="text-[#6B7280]">Couverture objectif : </span>
            <strong className="font-semibold text-[#111827]">
              {Math.min(150, Math.round((activePoint.signed / Math.max(1, monthlyTarget)) * 100))}%
            </strong>
          </div>

          {selectedMonth && (
            <button
              type="button"
              onClick={() => onSelectMonth(null)}
              className="text-[#6B7280] hover:text-[#BE123C] font-medium underline"
            >
              Réinitialiser le filtre
            </button>
          )}
        </div>
      </div>

      {/* 3. The Graphic Canvas */}
      <div className="relative pt-2">
        {/* Y-Axis Grid Lines & Labels */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
          {yTicks.map((val, idx) => (
            <div key={idx} className="flex items-center w-full gap-2">
              <span className="w-9 sm:w-12 text-right text-[10px] sm:text-[11px] font-medium text-[#9CA3AF] tabular-nums shrink-0 whitespace-nowrap">
                {Math.round(val / 1000)} k€
              </span>
              <div className="flex-1 border-t border-[#F3F4F6]" />
            </div>
          ))}
        </div>

        {/* Target Benchmark Line across chart */}
        {showTargetLine && (
          <div
            className="absolute left-10 sm:left-14 right-0 pointer-events-none z-10 flex items-center transition-all duration-300"
            style={{
              bottom: `calc(${32}px + ${(monthlyTarget / maxDataValue) * 78}%)`,
            }}
          >
            <div className="w-full border-t border-dashed border-[#059669]/60" />
            <span className="hidden sm:block absolute right-2 -top-2.5 px-2 py-0.5 rounded bg-white border border-[#A7F3D0] text-[#047857] text-[10px] font-bold shadow-2xs">
              Obj. {Math.round(monthlyTarget / 1000)} k€
            </span>
          </div>
        )}

        {/* VIEW A: DUAL BAR CHART (Colonnes dynamiques) */}
        {chartType === 'bar' ? (
          <div className="relative h-64 pl-10 sm:pl-14 pb-8 flex items-end justify-between gap-2 sm:gap-6 pt-4">
            {data.map((item, idx) => {
              const isHovered = hoveredIndex === idx;
              const isSelected = selectedMonth === item.month;
              const signedHeightPct = (item.signed / maxDataValue) * 100;
              const weightedHeightPct = (item.weighted / maxDataValue) * 100;

              return (
                <div
                  key={item.month}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() =>
                    onSelectMonth(selectedMonth === item.month ? null : item.month)
                  }
                  className={`flex-1 h-full flex flex-col items-center justify-end group cursor-pointer relative px-1 rounded-lg transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[#ECFDF5]/60'
                      : isHovered
                      ? 'bg-[#F9FAFB]'
                      : 'hover:bg-[#F9FAFB]/40'
                  }`}
                >
                  {/* Floating Value Pill: always visible on ≥sm, on tap/hover only on mobile (too cramped otherwise) */}
                  <div
                    className={`absolute -top-1 transition-all duration-200 pointer-events-none text-center ${
                      isHovered || isSelected
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 sm:opacity-75 scale-95'
                    }`}
                  >
                    <span className="font-display text-[11px] sm:text-xs font-bold text-[#047857] tabular-nums whitespace-nowrap bg-white/90 px-1.5 py-0.5 rounded border border-[#E4E7EC] shadow-2xs">
                      {Math.round(item.signed / 1000)} k€
                    </span>
                  </div>

                  {/* Dual Bar Columns */}
                  <div className="w-full max-w-[60px] h-full flex items-end justify-center gap-1 sm:gap-1.5 pb-1">
                    {/* Bar 1: Signed (Solid Deep Emerald) */}
                    {showSigned && (
                      <div
                        className={`w-1/2 rounded-t-[4px] bg-[#047857] transition-all duration-300 relative ${
                          isHovered || isSelected
                            ? 'brightness-110 shadow-sm'
                            : 'hover:brightness-105'
                        }`}
                        style={{ height: `${Math.max(4, signedHeightPct)}%` }}
                        title={`Facturation signée : ${formatCurrency(item.signed)}`}
                      />
                    )}

                    {/* Bar 2: Weighted (Luminous Mint Tint with Emerald Border) */}
                    {showWeighted && (
                      <div
                        className={`w-1/2 rounded-t-[4px] bg-[#ECFDF5] border border-[#10B981] transition-all duration-300 relative ${
                          isHovered || isSelected
                            ? 'bg-[#D1FAE5] border-[#059669]'
                            : ''
                        }`}
                        style={{ height: `${Math.max(4, weightedHeightPct)}%` }}
                        title={`Prévisionnel pondéré : ${formatCurrency(item.weighted)}`}
                      />
                    )}
                  </div>

                  {/* Month Label below bar */}
                  <div className="absolute -bottom-6 flex flex-col items-center">
                    <span
                      className={`text-[11px] sm:text-xs whitespace-nowrap transition-colors ${
                        isSelected
                          ? 'font-bold text-[#047857]'
                          : isHovered
                          ? 'font-semibold text-[#111827]'
                          : 'text-[#6B7280]'
                      }`}
                    >
                      <span className="sm:hidden">{item.month.split(' ')[0]}</span>
                      <span className="hidden sm:inline">{item.month}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* VIEW B: SMOOTH SVG SPLINE AREA CHART (Courbe & Aire continue) */
          <div className="relative h-64 pl-10 sm:pl-14 pb-8 pt-4">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Emerald Gradient Fill for Area */}
                <linearGradient id="emeraldAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#047857" stopOpacity="0.22" />
                  <stop offset="90%" stopColor="#047857" stopOpacity="0.01" />
                </linearGradient>

                <linearGradient id="mintAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.12" />
                  <stop offset="90%" stopColor="#10B981" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Area 2: Weighted */}
              {showWeighted && (
                <path
                  d={`${weightedPath} L ${svgWidth - paddingX},${svgHeight - paddingY} L ${paddingX},${svgHeight - paddingY} Z`}
                  fill="url(#mintAreaGradient)"
                />
              )}

              {/* Area 1: Signed */}
              {showSigned && (
                <path d={signedAreaPath} fill="url(#emeraldAreaGradient)" />
              )}

              {/* Curve 2: Weighted Line (Mint dashed) */}
              {showWeighted && (
                <path
                  d={weightedPath}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              )}

              {/* Curve 1: Signed Line (Deep Emerald Solid) */}
              {showSigned && (
                <path
                  d={signedPath}
                  fill="none"
                  stroke="#047857"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Data points and hover detectors */}
              {data.map((item, idx) => {
                const pSigned = getCoords(idx, item.signed);
                const pWeighted = getCoords(idx, item.weighted);
                const isHovered = hoveredIndex === idx;
                const isSelected = selectedMonth === item.month;

                return (
                  <g
                    key={item.month}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() =>
                      onSelectMonth(selectedMonth === item.month ? null : item.month)
                    }
                  >
                    {/* Vertical guideline on hover */}
                    {(isHovered || isSelected) && (
                      <line
                        x1={pSigned.x}
                        y1={paddingY}
                        x2={pSigned.x}
                        y2={svgHeight - paddingY}
                        stroke="#047857"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        opacity={0.6}
                      />
                    )}

                    {/* Dot for Weighted */}
                    {showWeighted && (
                      <circle
                        cx={pWeighted.x}
                        cy={pWeighted.y}
                        r={isHovered || isSelected ? 5 : 3.5}
                        fill="var(--surface-card)"
                        stroke="#10B981"
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />
                    )}

                    {/* Dot for Signed */}
                    {showSigned && (
                      <circle
                        cx={pSigned.x}
                        cy={pSigned.y}
                        r={isHovered || isSelected ? 6 : 4.5}
                        fill="#047857"
                        stroke="var(--surface-card)"
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* X-axis labels for Area chart */}
            <div className="absolute left-10 sm:left-14 right-0 bottom-0 flex justify-between px-1 sm:px-3">
              {data.map((item, idx) => {
                const isHovered = hoveredIndex === idx;
                const isSelected = selectedMonth === item.month;
                return (
                  <button
                    key={item.month}
                    type="button"
                    onClick={() =>
                      onSelectMonth(selectedMonth === item.month ? null : item.month)
                    }
                    className={`text-[11px] sm:text-xs whitespace-nowrap transition-colors cursor-pointer ${
                      isSelected
                        ? 'font-bold text-[#047857]'
                        : isHovered
                        ? 'font-semibold text-[#111827]'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    <span className="sm:hidden">{item.month.split(' ')[0]}</span>
                    <span className="hidden sm:inline">{item.month}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
