import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full h-9 bg-white text-[#111827] placeholder:text-[#9CA3AF] text-[13px] rounded-lg border border-[#E4E7EC] px-3 py-1.5 transition-colors duration-150 outline-none',
            'focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/12',
            icon && 'pl-9',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
