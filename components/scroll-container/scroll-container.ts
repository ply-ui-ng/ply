/** Scroll container resolution for scroll-top / scroll-bottom buttons. */
export type ScrollContainerTarget = 'window' | 'nearest' | (string & {});

export interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

/**
 * Resolves the element (or window) that should be scrolled.
 * - `window` — document viewport
 * - `nearest` — closest scrollable ancestor of `host`
 * - CSS selector — first matching element
 */
export function resolveScrollContainer(
  target: ScrollContainerTarget,
  host: HTMLElement
): HTMLElement | Window {
  if (!target || target === 'window') {
    return window;
  }

  if (target === 'nearest') {
    let el: HTMLElement | null = host.parentElement;
    while (el) {
      const { overflowY } = getComputedStyle(el);
      const scrollable =
        (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
        el.scrollHeight > el.clientHeight + 1;
      if (scrollable) return el;
      el = el.parentElement;
    }
    return window;
  }

  const found = document.querySelector(target);
  return found instanceof HTMLElement ? found : window;
}

export function getScrollMetrics(container: HTMLElement | Window): ScrollMetrics {
  if (container === window) {
    const doc = document.documentElement;
    return {
      scrollTop: window.scrollY || doc.scrollTop,
      scrollHeight: doc.scrollHeight,
      clientHeight: window.innerHeight,
    };
  }

  const el = container as HTMLElement;
  return {
    scrollTop: el.scrollTop,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
  };
}

export function scrollContainerTo(
  container: HTMLElement | Window,
  top: number,
  behavior: ScrollBehavior
): void {
  if (container === window) {
    window.scrollTo({ top, behavior });
    return;
  }
  (container as HTMLElement).scrollTo({ top, behavior });
}

export function listenScroll(
  container: HTMLElement | Window,
  handler: () => void
): () => void {
  const opts: AddEventListenerOptions = { passive: true };
  if (container === window) {
    window.addEventListener('scroll', handler, opts);
    window.addEventListener('resize', handler, opts);
    return () => {
      window.removeEventListener('scroll', handler, opts);
      window.removeEventListener('resize', handler, opts);
    };
  }

  const el = container as HTMLElement;
  el.addEventListener('scroll', handler, opts);
  window.addEventListener('resize', handler, opts);
  return () => {
    el.removeEventListener('scroll', handler, opts);
    window.removeEventListener('resize', handler, opts);
  };
}
