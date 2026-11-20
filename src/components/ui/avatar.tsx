'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials?: string;
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
}

export function Avatar({
  className,
  initials,
  src,
  alt = 'Avatar',
  size = 'md',
  online,
  ...props
}: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [src]);

  const sizes = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-8 h-8 text-label-md',
    lg: 'w-11 h-11 text-label-lg',
    xl: 'w-12 h-12 text-headline-sm',
  };

  const isSafeImageSrc = typeof src === 'string' && /^https:\/\/[^\s"'<>]+$/i.test(src.trim());
  const showImg = isSafeImageSrc && !imgFailed;

  return (
    <div className={cn('relative inline-flex shrink-0 select-none', className)} {...props}>
      <div
        className={cn(
          'rounded-md flex items-center justify-center font-semibold overflow-hidden border',
          showImg
            ? 'bg-surface-subtle text-text-primary border-border-base'
            : 'bg-[#047857] text-white border-[#065F46]',
          sizes[size]
        )}
      >
        {showImg ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials || 'U'}</span>
        )}
      </div>

      {online !== undefined && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 block rounded-full ring-2 ring-white',
            online ? 'bg-primary' : 'bg-neutral-300',
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
          )}
        />
      )}
    </div>
  );
}
