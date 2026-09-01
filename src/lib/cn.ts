import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Conditional class composition with Tailwind conflict resolution, so a
 * component's default utilities can always be overridden by a caller's
 * className without specificity guesswork.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
