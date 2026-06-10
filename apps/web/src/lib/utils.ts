import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n);
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'critical': return 'text-red-400 bg-red-500/20';
    case 'high': return 'text-orange-400 bg-orange-500/20';
    case 'medium': return 'text-yellow-400 bg-yellow-500/20';
    default: return 'text-green-400 bg-green-500/20';
  }
}
