import { DestroyRef, inject } from '@angular/core';

/**
 * Timers scoped to the lifetime of the component or directive that created them.
 *
 * A bare `setTimeout` outlives the thing that started it. In the browser that
 * leaks a callback which may write to an already-destroyed component. Under SSR
 * or prerendering it is worse: every route shares one process, so a stray timer
 * fires while an unrelated page is rendering and takes that page down with it.
 *
 * Must be called from an injection context — a field initializer or constructor.
 *
 * @example
 * export class MyComponent {
 *   private readonly timers = injectTimers();
 *
 *   constructor() {
 *     // Cancelled automatically if the component is destroyed first.
 *     this.timers.setTimeout(() => this.isLoading.set(false), 700);
 *   }
 * }
 */
export interface SafeTimers {
  /** `setTimeout` that is cleared automatically on destroy. */
  setTimeout(handler: () => void, ms?: number): ReturnType<typeof setTimeout>;
  /** `setInterval` that is cleared automatically on destroy. */
  setInterval(handler: () => void, ms: number): ReturnType<typeof setInterval>;
  /** Cancel one previously scheduled timer. */
  clear(id: ReturnType<typeof setTimeout> | undefined): void;
  /** Cancel everything still pending. */
  clearAll(): void;
}

export function injectTimers(): SafeTimers {
  const timeouts = new Set<ReturnType<typeof setTimeout>>();
  const intervals = new Set<ReturnType<typeof setInterval>>();

  const clearAll = () => {
    timeouts.forEach((id) => clearTimeout(id));
    intervals.forEach((id) => clearInterval(id));
    timeouts.clear();
    intervals.clear();
  };

  inject(DestroyRef).onDestroy(clearAll);

  return {
    setTimeout(handler, ms = 0) {
      const id = setTimeout(() => {
        timeouts.delete(id);
        handler();
      }, ms);
      timeouts.add(id);
      return id;
    },
    setInterval(handler, ms) {
      const id = setInterval(handler, ms);
      intervals.add(id);
      return id;
    },
    clear(id) {
      if (id === undefined) return;
      clearTimeout(id);
      clearInterval(id as ReturnType<typeof setInterval>);
      timeouts.delete(id);
      intervals.delete(id as ReturnType<typeof setInterval>);
    },
    clearAll,
  };
}
