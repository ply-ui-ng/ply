/**
 * Global Vitest setup for Ply free-tier unit tests (jsdom).
 */
class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly scrollMargin = '';
  readonly thresholds: readonly number[] = [];
  constructor(_cb?: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
    /* jsdom stub */
  }
  observe(): void {
    /* jsdom stub */
  }
  unobserve(): void {
    /* jsdom stub */
  }
  disconnect(): void {
    /* jsdom stub */
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

class ResizeObserverMock {
  constructor(_cb?: ResizeObserverCallback) {
    /* jsdom stub */
  }
  observe(): void {
    /* jsdom stub */
  }
  unobserve(): void {
    /* jsdom stub */
  }
  disconnect(): void {
    /* jsdom stub */
  }
}

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
});

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
});

Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  writable: true,
  value: function scrollIntoView() {
    /* jsdom stub */
  },
});
