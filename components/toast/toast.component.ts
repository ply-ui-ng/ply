import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterEveryRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { ToastItem } from './toast.service';
import { ToastPosition } from '../types';
import { injectTimers } from '../safe-timer/safe-timer';

const VISIBLE_COUNT = 3;
const PEEK_OFFSET = 14;
const EXPANDED_GAP = 12;
const SCALE_STEP = 0.05;
const DEFAULT_HEIGHT = 56;
const SWIPE_DISTANCE = 64;
const SWIPE_VELOCITY = 0.35;
const EXIT_MS = 280;
const COLLAPSE_DELAY_MS = 160;
const SPRING = '400ms cubic-bezier(0.22, 1.12, 0.36, 1)';

interface ToastGroup {
  position: ToastPosition;
  items: ToastItem[];
}

/**
 * Toast renderer used by {@link ToastService}. Do not place this selector in templates.
 *
 * Stacks like a deck: the newest toast is in front, older ones peek behind.
 * Hover or focus expands the stack; swipe dismisses; hover pauses auto-dismiss.
 * `prefers-reduced-motion` falls back to a static list with no scale or swipe tween.
 *
 * @example
 * this.toast.success('Saved');
 */
@Component({
  selector: 'ply-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  /** Timers cancelled automatically on destroy — see utils/safe-timer. */
  private readonly timers = injectTimers();
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly toasts = signal<ToastItem[]>([]);
  readonly expanded = signal(false);
  readonly reducedMotion = signal(false);
  readonly dragId = signal<number | null>(null);
  readonly dragX = signal(0);
  readonly dragY = signal(0);

  private readonly heights = signal<Map<number, number>>(new Map());
  private readonly enteringIds = signal<Set<number>>(new Set());

  private readonly remaining = new Map<number, number>();
  private readonly deadlines = new Map<number, number>();
  private readonly timeoutIds = new Map<number, ReturnType<typeof setTimeout>>();
  private paused = false;
  private collapseTimer?: ReturnType<typeof setTimeout>;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartTime = 0;

  readonly positionGroups = computed(() => {
    const positions = new Map<ToastPosition, ToastItem[]>();
    for (const t of this.toasts()) {
      const list = positions.get(t.position) || [];
      list.push(t);
      positions.set(t.position, list);
    }
    return Array.from(positions.entries()).map(([position, items]) => ({ position, items }));
  });

  constructor() {
    if (this.isBrowser) {
      const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      if (mq) {
        this.reducedMotion.set(mq.matches);
        const onChange = () => this.reducedMotion.set(mq.matches);
        mq.addEventListener('change', onChange);
        inject(DestroyRef).onDestroy(() => mq.removeEventListener('change', onChange));
      }
    }

    afterEveryRender(() => this.measureHeights());
  }

  addToast(toast: ToastItem) {
    this.toasts.set([...this.toasts(), toast]);

    if (!this.reducedMotion()) {
      this.enteringIds.update((s) => new Set(s).add(toast.id));
      this.timers.setTimeout(() => {
        this.enteringIds.update((s) => {
          const next = new Set(s);
          next.delete(toast.id);
          return next;
        });
      }, 16);
    }

    if (toast.duration > 0) {
      this.remaining.set(toast.id, toast.duration);
      if (!this.paused) {
        this.armTimer(toast.id);
      }
    }
  }

  removeToast(id: number) {
    this.toasts.set(this.toasts().map((t) => (t.id === id ? { ...t, removing: true } : t)));
  }

  cleanToast(id: number) {
    this.clearTimer(id);
    this.toasts.set(this.toasts().filter((t) => t.id !== id));
    this.heights.update((m) => {
      if (!m.has(id)) return m;
      const next = new Map(m);
      next.delete(id);
      return next;
    });
  }

  dismissToast(toast: ToastItem): void {
    this.dismissById(toast.id);
  }

  dismissById(id: number): void {
    const toast = this.toasts().find((t) => t.id === id);
    if (!toast || toast.removing) return;

    this.clearTimer(id);
    this.removeToast(id);

    const ms = this.reducedMotion() ? 0 : EXIT_MS;
    this.timers.setTimeout(() => this.cleanToast(id), ms);
  }

  dismissAll(): void {
    const ids = this.toasts()
      .filter((t) => !t.removing)
      .map((t) => t.id);
    for (const id of ids) {
      this.dismissById(id);
    }
  }

  onStackEnter(): void {
    this.timers.clear(this.collapseTimer);
    this.expanded.set(true);
    this.pauseTimers();
  }

  onStackLeave(event?: FocusEvent): void {
    if (event?.currentTarget instanceof Node && event.relatedTarget instanceof Node) {
      if (event.currentTarget.contains(event.relatedTarget)) return;
    }
    if (this.dragId() !== null) return;
    this.scheduleCollapse();
  }

  onPointerDown(event: PointerEvent, toast: ToastItem): void {
    if (this.reducedMotion()) return;
    if (event.button !== 0) return;
    if ((event.target as HTMLElement | null)?.closest('button')) return;

    this.dragId.set(toast.id);
    this.dragX.set(0);
    this.dragY.set(0);
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartTime = this.isBrowser ? performance.now() : 0;
    this.pauseTimers();

    try {
      (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    } catch {
      /* jsdom */
    }
  }

  onPointerMove(event: PointerEvent, toast: ToastItem): void {
    if (this.dragId() !== toast.id) return;
    this.dragX.set(event.clientX - this.dragStartX);
    this.dragY.set(event.clientY - this.dragStartY);
  }

  onPointerUp(event: PointerEvent, toast: ToastItem): void {
    if (this.dragId() !== toast.id) return;

    const dx = this.dragX();
    const dy = this.dragY();
    const elapsed = Math.max(1, (this.isBrowser ? performance.now() : 0) - this.dragStartTime);
    const velocity = Math.hypot(dx, dy) / elapsed;
    const shouldDismiss =
      !this.reducedMotion() &&
      this.isSwipeAway(toast.position, dx, dy) &&
      (Math.hypot(dx, dy) > SWIPE_DISTANCE || velocity > SWIPE_VELOCITY);

    this.dragId.set(null);
    this.dragX.set(0);
    this.dragY.set(0);

    if (shouldDismiss) {
      this.dismissById(toast.id);
    }

    if (!this.isPointerInStack(event)) {
      this.scheduleCollapse();
    }
  }

  getContainerClasses(position: ToastPosition): string {
    const stacked = !this.reducedMotion();
    const layout = stacked
      ? 'fixed z-[1200] pointer-events-auto w-full max-w-sm'
      : this.isTop(position)
        ? 'fixed z-[1200] flex flex-col-reverse gap-2 pointer-events-none w-full max-w-sm'
        : 'fixed z-[1200] flex flex-col gap-2 pointer-events-none w-full max-w-sm';
    const positionMap: Record<ToastPosition, string> = {
      'top-right': 'top-6 right-6 items-end',
      'top-left': 'top-6 left-6 items-start',
      'top-center': 'top-6 left-1/2 -translate-x-1/2 items-center',
      'bottom-right': 'bottom-6 right-6 items-end',
      'bottom-left': 'bottom-6 left-6 items-start',
      'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2 items-center',
    };
    return `${layout} ${positionMap[position]}`;
  }

  getContainerStyle(group: ToastGroup): Record<string, string> | null {
    if (this.reducedMotion()) return null;
    return {
      height: `${this.stackHeight(group)}px`,
      transition: `height ${SPRING}`,
    };
  }

  getToastClasses(toast: ToastItem): string {
    const dragging = this.dragId() === toast.id;
    const base =
      'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border max-w-sm w-full select-none will-change-transform';
    const cursor = this.reducedMotion()
      ? ''
      : dragging
        ? 'cursor-grabbing touch-none'
        : 'cursor-grab touch-none';
    const colorMap: Record<string, string> = {
      primary:
        'bg-white text-slate-800 border-blue-200 dark:bg-slate-800 dark:text-slate-200 dark:border-blue-800',
      success:
        'bg-white text-slate-800 border-green-200 dark:bg-slate-800 dark:text-slate-200 dark:border-green-800',
      danger:
        'bg-white text-slate-800 border-red-200 dark:bg-slate-800 dark:text-slate-200 dark:border-red-800',
      warning:
        'bg-white text-slate-800 border-orange-200 dark:bg-slate-800 dark:text-slate-200 dark:border-orange-800',
      accent:
        'bg-white text-slate-800 border-purple-200 dark:bg-slate-800 dark:text-slate-200 dark:border-purple-800',
    };
    return `${base} ${cursor} ${colorMap[toast.color]}`;
  }

  getToastStyle(toast: ToastItem, group: ToastGroup): Record<string, string> {
    const i = this.indexFromFront(toast, group.items);
    const top = this.isTop(group.position);
    const dragging = this.dragId() === toast.id;
    const reduced = this.reducedMotion();
    const expanded = reduced || this.expanded();
    const hidden = !expanded && i >= VISIBLE_COUNT;
    const entering = this.enteringIds().has(toast.id) && i === 0;

    const x = dragging ? this.dragX() : 0;
    let y = 0;
    let scale = 1;
    let opacity = toast.removing ? 0 : hidden ? 0 : 1;

    if (!reduced) {
      if (expanded) {
        y = this.expandedOffset(i, group, top);
      } else {
        scale = Math.max(0.85, 1 - i * SCALE_STEP);
        y = (top ? 1 : -1) * i * PEEK_OFFSET;
      }
      if (entering) {
        y += top ? -10 : 10;
        opacity = 0;
      }
      if (toast.removing && !dragging) {
        y += top ? -12 : 12;
        scale = 0.96;
      }
    }

    if (dragging) {
      y += this.dragY();
      opacity = Math.max(0.35, 1 - Math.hypot(this.dragX(), this.dragY()) / 220);
    }

    const style: Record<string, string> = {
      transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
      opacity: String(opacity),
      zIndex: String(100 - i),
      transformOrigin: top ? 'center top' : 'center bottom',
      transition:
        reduced || dragging ? 'none' : `transform ${SPRING}, opacity 200ms ease`,
    };

    if (!reduced) {
      style.position = 'absolute';
      style.left = '0';
      style.right = '0';
      if (top) {
        style.top = '0';
      } else {
        style.bottom = '0';
      }
    }

    if (hidden) {
      style.pointerEvents = 'none';
    }

    return style;
  }

  isToastInert(toast: ToastItem, group: ToastGroup): boolean {
    if (this.reducedMotion() || this.expanded()) return false;
    return this.indexFromFront(toast, group.items) >= VISIBLE_COUNT;
  }

  getIconClasses(toast: ToastItem): string {
    const base = 'w-5 h-5 min-w-5';
    const colorMap: Record<string, string> = {
      primary: 'stroke-blue-500 dark:stroke-blue-400',
      success: 'stroke-green-500 dark:stroke-green-400',
      danger: 'stroke-red-500 dark:stroke-red-400',
      warning: 'stroke-orange-500 dark:stroke-orange-400',
      accent: 'stroke-purple-500 dark:stroke-purple-400',
    };
    return `${base} ${colorMap[toast.color]}`;
  }

  getToastRole(toast: ToastItem): 'status' | 'alert' {
    return toast.color === 'danger' || toast.color === 'warning' ? 'alert' : 'status';
  }

  getCloseClasses(): string {
    return 'w-4 h-4 min-w-4 cursor-pointer stroke-slate-400 hover:stroke-slate-600 dark:stroke-slate-500 dark:hover:stroke-slate-300';
  }

  runAction(toast: ToastItem): void {
    toast.action?.onClick();
    if (toast.action?.dismiss !== false) {
      this.dismissToast(toast);
    }
  }

  private isTop(position: ToastPosition): boolean {
    return position.startsWith('top');
  }

  private indexFromFront(toast: ToastItem, items: ToastItem[]): number {
    const idx = items.findIndex((t) => t.id === toast.id);
    return items.length - 1 - idx;
  }

  private toastHeight(id: number): number {
    return this.heights().get(id) ?? DEFAULT_HEIGHT;
  }

  private expandedOffset(indexFromFront: number, group: ToastGroup, top: boolean): number {
    let offset = 0;
    for (let k = 0; k < indexFromFront; k++) {
      const item = group.items[group.items.length - 1 - k];
      offset += this.toastHeight(item.id) + EXPANDED_GAP;
    }
    return (top ? 1 : -1) * offset;
  }

  private stackHeight(group: ToastGroup): number {
    const items = group.items.filter((t) => !t.removing);
    if (items.length === 0) return 0;

    if (this.expanded()) {
      return items.reduce((sum, t, idx) => {
        return sum + this.toastHeight(t.id) + (idx === 0 ? 0 : EXPANDED_GAP);
      }, 0);
    }

    const visible = Math.min(items.length, VISIBLE_COUNT);
    const front = items[items.length - 1];
    return this.toastHeight(front.id) + Math.max(0, visible - 1) * PEEK_OFFSET;
  }

  private measureHeights(): void {
    if (!this.isBrowser || this.toasts().length === 0) return;
    const next = new Map<number, number>();
    const nodes: NodeList = this.host.nativeElement.querySelectorAll('[data-toast-id]');
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes.item(i) as HTMLElement | null;
      if (!el) continue;
      const id = Number(el.dataset['toastId']);
      if (!Number.isFinite(id)) continue;
      next.set(id, el.offsetHeight);
    }
    if (!sameHeightMap(this.heights(), next)) {
      this.heights.set(next);
    }
  }

  private armTimer(id: number): void {
    const ms = this.remaining.get(id);
    if (ms === undefined || ms <= 0) return;
    this.deadlines.set(id, Date.now() + ms);
    const tid = this.timers.setTimeout(() => this.dismissById(id), ms);
    this.timeoutIds.set(id, tid);
  }

  private clearTimer(id: number): void {
    const tid = this.timeoutIds.get(id);
    if (tid !== undefined) {
      this.timers.clear(tid);
      this.timeoutIds.delete(id);
    }
    this.remaining.delete(id);
    this.deadlines.delete(id);
  }

  private pauseTimers(): void {
    if (this.paused) return;
    this.paused = true;
    for (const [id, tid] of this.timeoutIds) {
      this.timers.clear(tid);
      const left = (this.deadlines.get(id) ?? Date.now()) - Date.now();
      this.remaining.set(id, Math.max(0, left));
    }
    this.timeoutIds.clear();
  }

  private resumeTimers(): void {
    if (!this.paused) return;
    this.paused = false;
    for (const toast of this.toasts()) {
      if (toast.removing || toast.duration <= 0) continue;
      this.armTimer(toast.id);
    }
  }

  private scheduleCollapse(): void {
    this.timers.clear(this.collapseTimer);
    this.collapseTimer = this.timers.setTimeout(() => {
      this.expanded.set(false);
      this.resumeTimers();
    }, COLLAPSE_DELAY_MS);
  }

  private isSwipeAway(position: ToastPosition, dx: number, dy: number): boolean {
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (absX < 8 && absY < 8) return false;

    const towardEdgeX =
      position.endsWith('right') ? dx > 0 : position.endsWith('left') ? dx < 0 : absX > absY;
    const towardEdgeY = this.isTop(position) ? dy < 0 : dy > 0;

    return towardEdgeX || towardEdgeY;
  }

  private isPointerInStack(event: PointerEvent): boolean {
    const stack = (event.currentTarget as HTMLElement | null)?.closest('[data-toast-stack]');
    if (!stack || !this.isBrowser) return false;
    const fromPoint = this.document.elementFromPoint;
    if (typeof fromPoint !== 'function') return false;
    const node = fromPoint.call(this.document, event.clientX, event.clientY);
    return !!node && stack.contains(node);
  }
}

function sameHeightMap(a: Map<number, number>, b: Map<number, number>): boolean {
  if (a.size !== b.size) return false;
  for (const [key, value] of a) {
    if (b.get(key) !== value) return false;
  }
  return true;
}
