/** Scroll container resolution for scroll-top / scroll-bottom buttons. */
export type ScrollContainerTarget = 'window' | 'nearest' | (string & {});

export interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

function browserWindow(): Window | null {
  return typeof window === 'undefined' ? null : window;
}

/**
 * Resolves the element (or window) that should be scrolled.
 * - `window` — document viewport
 * - `nearest` — closest scrollable ancestor of `host`
 * - CSS selector — first matching element
 * On the server, returns `host` so callers never touch `window` or `document`.
 */
export function resolveScrollContainer(
  target: ScrollContainerTarget,
  host: HTMLElement
): HTMLElement | Window {
  const view = browserWindow();
  if (!view) return host;

  if (!target || target === 'window') {
    return view;
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
    return view;
  }

  const found = view.document.querySelector(target);
  return found instanceof HTMLElement ? found : view;
}

export function getScrollMetrics(container: HTMLElement | Window): ScrollMetrics {
  const view = browserWindow();
  if (view && container === view) {
    const doc = view.document.documentElement;
    return {
      scrollTop: view.scrollY || doc.scrollTop,
      scrollHeight: doc.scrollHeight,
      clientHeight: view.innerHeight,
    };
  }

  if (!(container instanceof HTMLElement)) {
    return { scrollTop: 0, scrollHeight: 0, clientHeight: 0 };
  }

  return {
    scrollTop: container.scrollTop,
    scrollHeight: container.scrollHeight,
    clientHeight: container.clientHeight,
  };
}

export function scrollContainerTo(
  container: HTMLElement | Window,
  top: number,
  behavior: ScrollBehavior
): void {
  const view = browserWindow();
  if (view && container === view) {
    view.scrollTo({ top, behavior });
    return;
  }
  if (container instanceof HTMLElement) {
    container.scrollTo({ top, behavior });
  }
}

export function listenScroll(
  container: HTMLElement | Window,
  handler: () => void
): () => void {
  const view = browserWindow();
  if (!view) return () => undefined;

  const opts: AddEventListenerOptions = { passive: true };
  if (container === view) {
    view.addEventListener('scroll', handler, opts);
    view.addEventListener('resize', handler, opts);
    return () => {
      view.removeEventListener('scroll', handler, opts);
      view.removeEventListener('resize', handler, opts);
    };
  }

  const el = container as HTMLElement;
  el.addEventListener('scroll', handler, opts);
  view.addEventListener('resize', handler, opts);
  return () => {
    el.removeEventListener('scroll', handler, opts);
    view.removeEventListener('resize', handler, opts);
  };
}
