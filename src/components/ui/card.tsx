import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
}

export function Card({
  className,
  hoverLift = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-3xl border border-border-base shadow-card',
        hoverLift && 'card-hover-lift',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
