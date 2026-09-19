import {
  booleanAttribute,
  DestroyRef,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  Renderer2,
  signal,
} from '@angular/core';

import { lightboxInitialsFromAlt } from './lightbox-initials';

/**
 * Marks a projected `<img>` (or other element with a resolvable image URL) as a
 * lightbox thumbnail. Clicking it opens the parent `ply-lightbox` at this
 * thumb's index. Size and aspect ratio are controlled entirely by Tailwind
 * classes on the host element.
 *
 * Prefer native `<img src>` / `alt` attributes so the thumb paints in the page.
 * Use `imageSrc` / `imageAlt` only for non-`<img>` hosts.
 *
 * When the image fails to load (or has no `src`) and `initialsFallback` is true,
 * a placeholder with initials from `alt` / `imageAlt` is shown instead.
 *
 * @example
 * <ply-lightbox class="grid grid-cols-3 gap-2">
 *   <img
 *     ply-lightbox-thumb
 *     src="thumb.jpg"
 *     fullSrc="full.jpg"
 *     alt="Coast"
 *     class="aspect-square w-full cursor-pointer rounded-lg object-cover"
 *   />
 * </ply-lightbox>
 */
@Directive({
  selector: '[ply-lightbox-thumb]',
  host: {
    role: 'button',
    tabindex: '0',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class LightboxThumbDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Optional full-resolution URL shown in the overlay. Falls back to the
   * element's native `src` (or `imageSrc`) when omitted.
   *
   * @example
   * <img ply-lightbox-thumb src="thumb.jpg" fullSrc="full.jpg" alt="Coast" />
   */
  readonly fullSrc = input<string>('');

  /**
   * Image URL for non-`<img>` hosts. Do **not** use this on `<img>` — bind the
   * native `src` attribute instead so the thumbnail is visible.
   *
   * @example
   * <button type="button" ply-lightbox-thumb imageSrc="photo.jpg" class="…">Open</button>
   */
  readonly imageSrc = input<string>('');

  /**
   * Accessible label override for non-`<img>` hosts. On `<img>`, use native `alt`.
   *
   * @example
   * <button type="button" ply-lightbox-thumb imageSrc="a.jpg" imageAlt="Sunset">Open</button>
   */
  readonly imageAlt = input<string>('');

  /**
   * Suggested filename for the download action.
   *
   * @example
   * <img ply-lightbox-thumb src="a.jpg" downloadName="sunset.jpg" />
   */
  readonly downloadName = input<string>('');

  /**
   * When true (default), a broken or missing image is replaced by initials
   * derived from `alt` / `imageAlt` (e.g. "Jane Doe" → "JD").
   *
   * @example
   * <img ply-lightbox-thumb src="missing.jpg" alt="Jane Doe" [initialsFallback]="true" />
   */
  readonly initialsFallback = input(true, { transform: booleanAttribute });

  /** @internal Wired by LightboxComponent. */
  openHandler?: (thumb: LightboxThumbDirective) => void;

  /** True after a load failure (or empty src) when initials are shown. */
  readonly failed = signal(false);

  private placeholder?: HTMLElement;
  private unlistenClick?: () => void;
  private unlistenKey?: () => void;

  constructor() {
    this.destroyRef.onDestroy(() => this.teardownPlaceholder());
    // Empty/missing src on an <img> never fires `error` in every browser — paint initials once.
    queueMicrotask(() => this.checkEmptySrc());
  }

  /** Resolved URL for the overlay viewer. */
  resolveSrc(): string {
    const full = this.fullSrc().trim();
    if (full) return full;
    const explicit = this.imageSrc().trim();
    if (explicit) return explicit;
    const host = this.el.nativeElement;
    if (host instanceof HTMLImageElement && host.src) return host.currentSrc || host.src;
    return host.getAttribute('src') || '';
  }

  /** Resolved alt / accessible name. */
  resolveAlt(): string {
    const override = this.imageAlt().trim();
    if (override) return override;
    const host = this.el.nativeElement;
    if (host instanceof HTMLImageElement) return host.alt || '';
    return host.getAttribute('alt') || '';
  }

  /** Initials derived from the resolved alt text. */
  resolveInitials(): string {
    return lightboxInitialsFromAlt(this.resolveAlt());
  }

  /** Resolved download filename. */
  resolveDownloadName(): string {
    const named = this.downloadName().trim();
    if (named) return named;
    const url = this.resolveSrc();
    try {
      const path = new URL(url, 'https://local.invalid').pathname;
      const base = path.split('/').pop();
      if (base) return decodeURIComponent(base.split('?')[0] || 'image');
    } catch {
      /* ignore */
    }
    return 'image';
  }

  protected ariaLabel(): string {
    const a = this.resolveAlt();
    return a ? `View image: ${a}` : 'View image';
  }

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    event.preventDefault();
    this.openHandler?.(this);
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  onKeyActivate(event: Event) {
    event.preventDefault();
    this.openHandler?.(this);
  }

  @HostListener('error')
  onError() {
    this.applyInitialsFallback();
  }

  private checkEmptySrc() {
    const host = this.el.nativeElement;
    if (!(host instanceof HTMLImageElement)) return;
    if (!host.getAttribute('src') && !this.imageSrc().trim()) {
      this.applyInitialsFallback();
    }
  }

  private applyInitialsFallback() {
    if (!this.initialsFallback() || this.failed()) return;
    const host = this.el.nativeElement;
    if (!(host instanceof HTMLImageElement)) return;

    this.failed.set(true);
    this.renderer.addClass(host, 'hidden');
    this.renderer.setAttribute(host, 'aria-hidden', 'true');

    const placeholder = this.renderer.createElement('div') as HTMLElement;
    placeholder.textContent = this.resolveInitials();
    placeholder.setAttribute('role', 'button');
    placeholder.tabIndex = 0;
    placeholder.setAttribute('aria-label', this.ariaLabel());
    placeholder.className = [
      host.className,
      'inline-flex items-center justify-center bg-slate-200 font-semibold text-slate-700',
      'dark:bg-slate-700 dark:text-slate-100 select-none',
    ]
      .filter(Boolean)
      .join(' ');

    const parent = host.parentNode;
    if (parent) {
      this.renderer.insertBefore(parent, placeholder, host.nextSibling);
    }

    this.unlistenClick = this.renderer.listen(placeholder, 'click', (e: Event) => {
      e.preventDefault();
      this.openHandler?.(this);
    });
    this.unlistenKey = this.renderer.listen(placeholder, 'keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      this.openHandler?.(this);
    });

    this.placeholder = placeholder;
  }

  private teardownPlaceholder() {
    this.unlistenClick?.();
    this.unlistenKey?.();
    this.unlistenClick = undefined;
    this.unlistenKey = undefined;
    if (this.placeholder?.parentNode) {
      this.renderer.removeChild(this.placeholder.parentNode, this.placeholder);
    }
    this.placeholder = undefined;
  }
}
