import React from 'react';
import { cn } from '@/lib/utils';
import { STAGES } from '@/lib/mock-data';

interface StageChipProps {
  stageId: 'lead' | 'discovery' | 'proposal' | 'negotiation' | 'won' | 'urgent';
  label?: string;
  className?: string;
  showDot?: boolean;
}

export function StageChip({ stageId, label, className, showDot = true }: StageChipProps) {
  if (stageId === 'urgent') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-label-sm font-medium border',
          'bg-[#FDF2F4] text-[#9F1239] border-[#FBCFE8]',
          className
        )}
      >
        {showDot && <span className="w-1.5 h-1.5 rounded-full bg-[#BE123C] shrink-0" />}
        {label || 'À relancer'}
      </span>
    );
  }

  const stage = STAGES.find((s) => s.id === stageId) || STAGES[0];
  const displayLabel = label || stage.name;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-label-sm font-medium border transition-colors',
        className
      )}
      style={{
        backgroundColor: stage.chipBg,
        color: stage.chipText,
        borderColor: `${stage.chipText}25`,
      }}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: stage.colorHex }}
        />
      )}
      {displayLabel}
    </span>
  );
}
