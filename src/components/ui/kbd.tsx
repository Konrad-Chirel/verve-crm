import React from 'react';
import { cn } from '@/lib/utils';

export function Kbd({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[11px] font-semibold text-text-secondary bg-neutral-100 border border-neutral-300 rounded shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)] font-mono select-none',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
