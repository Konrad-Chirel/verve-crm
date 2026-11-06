import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'mint' | 'amber' | 'coral' | 'lilac' | 'cyan' | 'indigo';
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'neutral',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    neutral: 'bg-neutral-100 text-text-secondary border-neutral-200',
    mint: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    amber: 'bg-[#FEFCE8] text-[#CA8A04] border-[#FEF08A]',
    coral: 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]',
    lilac: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
    cyan: 'bg-[#ECFEFF] text-[#0891B2] border-[#A5F3FC]',
    indigo: 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]',
  };

  const dots = {
    neutral: 'bg-neutral-400',
    mint: 'bg-primary-mint',
    amber: 'bg-amber-500',
    coral: 'bg-[#F43F5E]',
    lilac: 'bg-[#8B5CF6]',
    cyan: 'bg-[#06B6D4]',
    indigo: 'bg-[#4F46E5]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-semibold tracking-wide border',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dots[variant])} />}
      {children}
    </span>
  );
}
