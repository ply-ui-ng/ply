import { A11yModule } from '@angular/cdk/a11y';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { cn } from '../tw-merge/tw-merge';
import { IconComponent } from '../icon/icon.component';
import { lightboxInitialsFromAlt } from './lightbox-initials';
import { LightboxThumbDirective } from './lightbox-thumb.directive';

export { lightboxInitialsFromAlt } from './lightbox-initials';

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

const fade = trigger('fade', [
  transition(':enter', [style({ opacity: 0 }), animate('150ms ease-out', style({ opacity: 1 }))]),
  transition(':leave', [animate('120ms ease-in', style({ opacity: 0 }))]),
]);

/**
 * Lightbox gallery. Project one or more `[ply-lightbox-thumb]` images — size
 * and aspect ratio are controlled with Tailwind on each thumb. Clicking a thumb
 * opens a focus-trapped overlay with flip, rotate, zoom, download, and
 * browser-fullscreen toolbar actions.
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
@Component({
  selector: 'ply-lightbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [A11yModule, IconComponent, IconButtonDirective],
  templateUrl: './lightbox.component.html',
  host: { '[class]': 'hostCls()' },
  animations: [fade],
})
export class LightboxComponent {
  /**
   * Classes for the thumbs layout wrapper (e.g. `grid grid-cols-3 gap-2`).
   * Applied to an inner container so projected thumbs participate in that layout.
   *
   * @example
   * <ply-lightbox class="flex flex-wrap gap-3">…</ply-lightbox>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * When true, prev/next wrap around the ends of the gallery.
   *
   * @example
   * <ply-lightbox [loop]="false">…</ply-lightbox>
   */
  readonly loop = input(true, { transform: booleanAttribute });

  /**
   * Whether to show the transform / download toolbar.
   *
   * @example
   * <ply-lightbox [showToolbar]="false">…</ply-lightbox>
   */
  readonly showToolbar = input(true, { transform: booleanAttribute });

  /**
   * Whether to show the "n / total" counter when there is more than one image.
   *
   * @example
   * <ply-lightbox [showCounter]="false">…</ply-lightbox>
   */
  readonly showCounter = input(true, { transform: booleanAttribute });

  /**
   * Close the overlay when the backdrop is clicked.
   *
   * @example
   * <ply-lightbox [closeOnBackdrop]="false">…</ply-lightbox>
   */
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });

  /**
   * Accessible name for the lightbox dialog.
   *
   * @example
   * <ply-lightbox dialogLabel="Photo gallery">…</ply-lightbox>
   */
  readonly dialogLabel = input('Image lightbox');

  /**
   * When true (default), a broken or missing viewer image shows initials from
   * the thumb's `alt` / `imageAlt` instead of an empty stage.
   *
   * @example
   * <ply-lightbox [initialsFallback]="true">…</ply-lightbox>
   */
  readonly initialsFallback = input(true, { transform: booleanAttribute });

  /**
   * Emitted when the lightbox opens, with the active index.
   *
   * @example
   * <ply-lightbox (opened)="onOpened($event)">…</ply-lightbox>
   */
  readonly opened = output<number>();

  /**
   * Emitted when the lightbox closes.
   *
   * @example
   * <ply-lightbox (closed)="onClosed()">…</ply-lightbox>
   */
  readonly closed = output<void>();

  /**
   * Emitted whenever the active image index changes while open.
   *
   * @example
   * <ply-lightbox (indexChange)="onIndex($event)">…</ply-lightbox>
   */
  readonly indexChange = output<number>();

  protected readonly hostCls = computed(() => cn('contents'));
  protected readonly thumbsCls = computed(() => cn(this.extraClass()));

  readonly thumbs = contentChildren(LightboxThumbDirective, { descendants: true });

  readonly isOpen = signal(false);
  readonly activeIndex = signal(0);
  readonly rotation = signal(0);
  readonly flipX = signal(false);
  readonly flipY = signal(false);
  readonly zoom = signal(1);
  readonly isFullscreen = signal(false);
  /** True when the active overlay image failed to load. */
  readonly viewerFailed = signal(false);

  private readonly overlayRef = viewChild<ElementRef<HTMLElement>>('overlayRoot');

  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly activeThumb = computed(() => {
    const list = this.thumbs();
    const i = this.activeIndex();
    return list[i] ?? null;
  });

  protected readonly activeSrc = computed(() => this.activeThumb()?.resolveSrc() ?? '');
  protected readonly activeAlt = computed(() => this.activeThumb()?.resolveAlt() ?? '');
  protected readonly activeInitials = computed(() =>
    lightboxInitialsFromAlt(this.activeAlt()),
  );
  protected readonly showViewerInitials = computed(
    () =>
      this.initialsFallback() &&
      (this.viewerFailed() || !this.activeSrc() || !!this.activeThumb()?.failed()),
  );

  protected readonly imageTransform = computed(() => {
    const sx = this.flipX() ? -1 : 1;
    const sy = this.flipY() ? -1 : 1;
    return `rotate(${this.rotation()}deg) scale(${sx * this.zoom()}, ${sy * this.zoom()})`;
  });

  protected readonly canNavigate = computed(() => this.thumbs().length > 1);

  protected readonly counterText = computed(() => {
    const total = this.thumbs().length;
    if (total <= 1) return '';
    return `${this.activeIndex() + 1} / ${total}`;
  });

  constructor() {
    effect(() => {
      const list = this.thumbs();
      for (const thumb of list) {
        thumb.openHandler = (t) => this.openAtThumb(t);
      }
    });

    effect(() => {
      if (!this.isBrowser) return;
      this.document.body.style.overflow = this.isOpen() ? 'hidden' : '';
    });

    inject(DestroyRef).onDestroy(() => {
      if (!this.isBrowser) return;
      this.document.body.style.overflow = '';
      if (this.document.fullscreenElement) {
        void this.document.exitFullscreen?.();
      }
    });
  }

  /**
   * Open the lightbox at the given index (default `0`).
   *
   * @example
   * lightbox.open(2);
   */
  open(index = 0) {
    const list = this.thumbs();
    if (!list.length) return;
    const i = Math.max(0, Math.min(index, list.length - 1));
    this.resetTransforms();
    this.viewerFailed.set(false);
    this.activeIndex.set(i);
    this.isOpen.set(true);
    this.opened.emit(i);
    this.indexChange.emit(i);
  }

  /**
   * Close the lightbox and exit browser fullscreen if active.
   *
   * @example
   * lightbox.close();
   */
  close() {
    if (!this.isOpen()) return;
    this.exitFullscreen();
    this.isOpen.set(false);
    this.resetTransforms();
    this.closed.emit();
  }

  /**
   * Show the next image (respects `loop`).
   *
   * @example
   * lightbox.next();
   */
  next() {
    const total = this.thumbs().length;
    if (total <= 1) return;
    const i = this.activeIndex();
    if (i >= total - 1) {
      if (!this.loop()) return;
      this.setIndex(0);
      return;
    }
    this.setIndex(i + 1);
  }

  /**
   * Show the previous image (respects `loop`).
   *
   * @example
   * lightbox.prev();
   */
  prev() {
    const total = this.thumbs().length;
    if (total <= 1) return;
    const i = this.activeIndex();
    if (i <= 0) {
      if (!this.loop()) return;
      this.setIndex(total - 1);
      return;
    }
    this.setIndex(i - 1);
  }

  protected flipHorizontal() {
    this.flipX.update((v) => !v);
  }

  protected flipVertical() {
    this.flipY.update((v) => !v);
  }

  protected rotate90() {
    this.rotation.update((r) => (r + 90) % 360);
  }

  protected zoomIn() {
    this.zoom.update((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  }

  protected zoomOut() {
    this.zoom.update((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
  }

  protected async download() {
    const thumb = this.activeThumb();
    if (!thumb || !this.isBrowser) return;
    const url = thumb.resolveSrc();
    if (!url) return;
    const name = thumb.resolveDownloadName();

    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      this.triggerDownload(objectUrl, name);
      URL.revokeObjectURL(objectUrl);
    } catch {
      this.triggerDownload(url, name);
    }
  }

  protected async toggleFullscreen() {
    if (!this.isBrowser) return;
    const root = this.overlayRef()?.nativeElement;
    if (!root) return;

    try {
      if (this.document.fullscreenElement) {
        await this.document.exitFullscreen();
        this.isFullscreen.set(false);
      } else {
        await root.requestFullscreen();
        this.isFullscreen.set(true);
      }
    } catch {
      this.isFullscreen.set(!!this.document.fullscreenElement);
    }
  }

  protected onBackdropClick() {
    if (this.closeOnBackdrop()) this.close();
  }

  protected onWheel(event: WheelEvent) {
    if (!this.isOpen()) return;
    event.preventDefault();
    if (event.deltaY < 0) this.zoomIn();
    else this.zoomOut();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.isOpen()) return;
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.next();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.prev();
        break;
      case '+':
      case '=':
        event.preventDefault();
        this.zoomIn();
        break;
      case '-':
      case '_':
        event.preventDefault();
        this.zoomOut();
        break;
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange() {
    if (!this.isBrowser) return;
    this.isFullscreen.set(!!this.document.fullscreenElement);
  }

  private openAtThumb(thumb: LightboxThumbDirective) {
    const index = this.thumbs().indexOf(thumb);
    this.open(index < 0 ? 0 : index);
  }

  protected onViewerError() {
    if (this.initialsFallback()) this.viewerFailed.set(true);
  }

  private setIndex(index: number) {
    this.resetTransforms();
    this.viewerFailed.set(false);
    this.activeIndex.set(index);
    this.indexChange.emit(index);
  }

  private resetTransforms() {
    this.rotation.set(0);
    this.flipX.set(false);
    this.flipY.set(false);
    this.zoom.set(1);
  }

  private exitFullscreen() {
    if (!this.isBrowser) return;
    if (this.document.fullscreenElement) {
      void this.document.exitFullscreen?.();
    }
    this.isFullscreen.set(false);
  }

  private triggerDownload(href: string, name: string) {
    const a = this.document.createElement('a');
    a.href = href;
    a.download = name;
    a.rel = 'noopener';
    a.target = '_blank';
    this.document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
