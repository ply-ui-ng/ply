import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely, resolving conflicts using tailwind-merge and clsx.
 * Copied components record `tailwind-merge` as a tracked npm dependency via the CLI.
 * Use this to allow users to override default tailwind classes on components.
 * 
 * @example
 * cn('bg-blue-500 p-1', 'bg-red-500') // => 'p-1 bg-red-500'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Shared focus-visible ring. `--ply-ring` / `--ply-background` are defined
 * in `ply-ui.css` (CLI init) so consumers and the docs site share one token.
 */
export const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-[var(--ply-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ply-background)]';

/** Inset ring for compact controls (calendar day cells, standalone chips). */
export const FOCUS_RING_INSET =
  'outline-none! focus-visible:ring-2! focus-visible:ring-inset! focus-visible:ring-[var(--ply-ring)]!';

/**
 * Ring on an input-group wrapper. `focus-within` so start/end addons stay
 * inside the halo; the inner `ply-input` / `ply-textarea` stays ring-free.
 */
export const FOCUS_RING_WITHIN =
  'focus-within:ring-2! focus-within:ring-inset! focus-within:ring-[var(--ply-ring)]!';

/** Selected / highlighted row in lists (select, combobox, command palette). */
export const PRIMARY_SOFT =
  'bg-[var(--ply-primary-soft)] text-[var(--ply-primary)]';
