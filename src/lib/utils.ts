import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);

  // Replace normal space with non-breaking space
  return formatted.replace(/\s/g, '\u00A0');
}

export function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatDateFrench(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Neutralize spreadsheet formula/DDE injection (CWE-1236) and escape quotes/newlines.
 */
export function sanitizeCsvCell(raw: string | number | undefined | null): string {
  const str = String(raw ?? '');
  const normalized = str.replace(/[\r\n]+/g, ' ');
  const isSafePhone = /^\+[0-9\s().-]+$/.test(normalized.trim());
  const needsEscape = /^\s*[=+\-@\t\r]/.test(normalized) && !isSafePhone;
  const safe = needsEscape ? `'${normalized}` : normalized;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function sanitizeSafeId(raw: unknown, fallbackPrefix: string): string {
  if (typeof raw === 'string') {
    const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
    if (cleaned.length > 0) return cleaned;
  }
  return `${fallbackPrefix}-${Date.now()}`;
}

export function isSafeStoragePath(path: unknown, uid?: string | null): path is string {
  if (typeof path !== 'string' || !uid) return false;
  if (path.includes('..') || path.includes('\\') || /[\s?#%]/.test(path)) return false;
  const escapedUid = uid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const allowlist = new RegExp(`^${escapedUid}/[a-zA-Z0-9_-]{1,80}/[a-zA-Z0-9._-]{1,160}$`);
  return allowlist.test(path);
}
