/**
 * Writing direction for Ply components.
 *
 * `left` / `right` stay on those physical screen edges.
 * `start` / `end` follow the nearest `dir` (right-to-left when `dir="rtl"`).
 */
export type WritingDirection = 'ltr' | 'rtl';

export type PhysicalEdge = 'left' | 'right';

export type InlineEdge = PhysicalEdge | 'start' | 'end';

const RTL_LOCALE =
  /^(ar|ckb|dv|fa|he|nqo|ps|sd|ug|ur|yi)(?!.*[-_](Latn|Cyrl)($|-|_))([-_]|$)/i;

/** Resolve a `dir` attribute, including `auto` from the active language. */
export function resolveWritingDirection(
  raw: string | null | undefined,
  language?: string | null,
): WritingDirection {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === 'rtl') return 'rtl';
  if (value === 'ltr') return 'ltr';
  if (value === 'auto' && language && RTL_LOCALE.test(language)) return 'rtl';
  return 'ltr';
}

/** Nearest `dir` on `el` or its ancestors, then `<html>` / `<body>`. */
export function directionFromElement(el: Element | null | undefined, doc: Document): WritingDirection {
  let node: Element | null = el ?? null;
  while (node) {
    const raw = node.getAttribute?.('dir');
    if (raw) {
      const lang = (node as HTMLElement).lang || doc.documentElement?.lang;
      return resolveWritingDirection(raw, lang);
    }
    node = node.parentElement;
  }
  const root = doc.documentElement;
  const raw = root?.getAttribute('dir') || doc.body?.getAttribute('dir');
  return resolveWritingDirection(raw, root?.lang);
}

/** `start` / `end` become physical edges. `left` / `right` are unchanged. */
export function logicalToPhysical(edge: InlineEdge, direction: WritingDirection): PhysicalEdge {
  if (edge === 'left' || edge === 'right') return edge;
  const rtl = direction === 'rtl';
  if (edge === 'start') return rtl ? 'right' : 'left';
  return rtl ? 'left' : 'right';
}

/**
 * Shell and sidenav slots named `left` are the start edge.
 * In RTL that slot sits on the physical right; `right` sits on the physical left.
 */
export function readingEdge(slot: PhysicalEdge, direction: WritingDirection): PhysicalEdge {
  if (direction === 'ltr') return slot;
  return slot === 'left' ? 'right' : 'left';
}

/**
 * DOM-order delta for a horizontal arrow.
 * ArrowRight moves forward in LTR and backward in RTL (WAI-ARIA).
 */
export function inlineArrowDelta(key: string, direction: WritingDirection): 1 | -1 | null {
  const rtl = direction === 'rtl';
  if (key === 'ArrowRight') return rtl ? -1 : 1;
  if (key === 'ArrowLeft') return rtl ? 1 : -1;
  return null;
}

/** True when `key` moves toward the inline end (next tab, expand a tree, open a submenu). */
export function isInlineForwardKey(key: string, direction: WritingDirection): boolean {
  return inlineArrowDelta(key, direction) === 1;
}

/** True when `key` moves toward the inline start. */
export function isInlineBackwardKey(key: string, direction: WritingDirection): boolean {
  return inlineArrowDelta(key, direction) === -1;
}

/** Map `top-end` / `bottom-start` onto a physical corner. Physical names pass through. */
export function resolveCornerPosition(position: string, direction: WritingDirection): string {
  return position
    .replace(/-start\b/g, direction === 'rtl' ? '-right' : '-left')
    .replace(/-end\b/g, direction === 'rtl' ? '-left' : '-right');
}

export type BoxEdge = 'left' | 'right' | 'top' | 'bottom' | 'start' | 'end';

/** Drawer / sheet edge. Vertical edges stay put; start/end follow direction. */
export function resolveBoxEdge(
  edge: BoxEdge,
  direction: WritingDirection,
): 'left' | 'right' | 'top' | 'bottom' {
  if (edge === 'top' || edge === 'bottom' || edge === 'left' || edge === 'right') return edge;
  return logicalToPhysical(edge, direction);
}

/**
 * Positive `towardEndPx` scrolls toward the inline end.
 * Uses physical `scrollBy({ left })`, inverted in RTL.
 */
export function scrollByInline(
  el: HTMLElement,
  towardEndPx: number,
  direction: WritingDirection,
): void {
  const left = direction === 'rtl' ? -towardEndPx : towardEndPx;
  el.scrollBy({ left, behavior: 'smooth' });
}

/**
 * Whether a horizontal scroller is at the inline start / end.
 * Handles both the negative-scrollLeft RTL model (Chromium) and the
 * legacy positive-from-the-left model.
 */
export function inlineScrollState(
  el: Pick<HTMLElement, 'scrollLeft' | 'scrollWidth' | 'clientWidth'>,
  direction: WritingDirection,
): { atStart: boolean; atEnd: boolean } {
  const max = el.scrollWidth - el.clientWidth;
  if (max <= 2) return { atStart: true, atEnd: true };
  const raw = el.scrollLeft;
  const fromStart = direction === 'rtl' ? (raw <= 0 ? -raw : max - raw) : raw;
  return { atStart: fromStart <= 2, atEnd: fromStart >= max - 2 };
}

const HORIZONTAL_ICON = /(?:^|-)(?:left|right)(?:-|$)/;

/** Icons that point along the inline axis and should mirror under `dir="rtl"`. */
export function isDirectionalIcon(name: string | null | undefined): boolean {
  if (!name) return false;
  return HORIZONTAL_ICON.test(name);
}

/** Keep a physical left/right CDK position on that edge after RTL start/end mapping. */
export function flipInlineAxis<T extends string>(axis: T): T {
  if (axis === 'start') return 'end' as T;
  if (axis === 'end') return 'start' as T;
  return axis;
}
