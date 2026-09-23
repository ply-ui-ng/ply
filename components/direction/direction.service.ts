import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';

/**
 * Bumps whenever a `dir` or `lang` attribute changes under `<html>`.
 * Components read this so layout and keyboard behavior follow the live direction.
 */
@Injectable({ providedIn: 'root' })
export class DirectionRegistry {
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly version = signal(0);

  /** Read in a computed() to re-check direction after `dir` changes. */
  readonly tick = this.version.asReadonly();

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    afterNextRender(() => {
      const root = this.doc.documentElement;
      if (!root) return;
      const observer = new MutationObserver(() => this.version.update((n) => n + 1));
      observer.observe(root, {
        attributes: true,
        attributeFilter: ['dir', 'lang'],
        subtree: true,
      });
    });
  }

  /**
   * Set `<html dir>` and notify listeners in the same turn.
   *
   * @example
   * direction.setDocumentDirection('rtl');
   */
  setDocumentDirection(dir: 'ltr' | 'rtl'): void {
    this.doc.documentElement?.setAttribute('dir', dir);
    this.version.update((n) => n + 1);
  }
}
