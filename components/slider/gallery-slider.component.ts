import { Component,
  OnDestroy,
  AfterContentInit,
  HostListener,
  PLATFORM_ID,
  inject,
  forwardRef,
  input,
  output,
  model,
  computed,
  contentChildren,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { injectElementDirection } from '../direction/inject-direction';
import { IconComponent } from '../icon/icon.component';
import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { GALLERY_SLIDER_TOKEN } from './slider.tokens';
import { CarouselItemComponent } from './carousel-item/carousel-item.component';
import { cn } from '../tw-merge/tw-merge';

/**
 * A highly configurable image/content carousel component.
 * Supports auto-play, touch swiping, and slide/crossfade transitions.
 *
 * @example
 * <ply-gallery-slider [interval]="3000" transition="crossfade" [wrap]="true">
 *   <ply-carousel-item>Slide 1 content</ply-carousel-item>
 *   <ply-carousel-item>Slide 2 content</ply-carousel-item>
 * </ply-gallery-slider>
 */
@Component({
  selector: 'ply-gallery-slider, ply-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, IconButtonDirective],
  templateUrl: './gallery-slider.component.html',
  providers: [
    { provide: GALLERY_SLIDER_TOKEN, useExisting: forwardRef(() => GallerySliderComponent) }],
  host: {
    '[class]': 'hostClass()',
    '[class.carousel-dark]': 'dark()',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class GallerySliderComponent implements AfterContentInit, OnDestroy {
  private readonly writingDirection = injectElementDirection();
  /** Additional CSS classes to merge into the host element. */
  readonly extraClass = input('', { alias: "class" });

  readonly hostClass = computed(() => {
    return cn(
      'carousel relative block overflow-hidden rounded-xl group hover:opacity-100',
      this.extraClass()
    );
  });

  /** The zero-based index of the currently active slide. */
  readonly activeIndex = model<number>(0);

  /** Whether transitions are animated. */
  readonly animate = input(true, { transform: booleanAttribute });

  /** Applies a dark-themed visual overlay/buttons. */
  readonly dark = input(false, { transform: booleanAttribute });

  /** Defines the transition direction explicitly. */
  readonly direction = model<'next' | 'prev'>('next');

  /** Milliseconds before auto-advancing to the next slide. Set to 0 to disable. */
  readonly interval = input<number>(5000);

  /** Whether to pause autoplay on hover. */
  readonly pause = input<'hover' | false>('hover');

  /** Whether touch swipe navigation is enabled. */
  readonly touch = input(true, { transform: booleanAttribute });

  /** The animation transition style. */
  readonly transition = input<'slide' | 'crossfade'>('slide');

  /** Whether the carousel loops back to the start when reaching the end. */
  readonly wrap = input(true, { transform: booleanAttribute });

  /** Optional array of image source URLs for a quick image-only slider. */
  readonly slides = input<string[]>([]);

  /** Emitted whenever the active slide index changes. */
  readonly itemChange = output<number>();

  readonly items = contentChildren(CarouselItemComponent, { descendants: true });

  readonly totalItems = computed(() => {
    return this.items().length > 0 ? this.items().length : (this.slides()?.length || 1);
  });

  /** Slide track moves toward the inline end, so RTL shifts the opposite way. */
  readonly trackTransform = computed(() => {
    if (this.transition() !== 'slide') return 'none';
    const shift = this.activeIndex() * (100 / this.totalItems());
    const sign = this.writingDirection() === 'rtl' ? 1 : -1;
    return `translateX(${sign * shift}%)`;
  });

  readonly trackClass = computed(() => cn(
    'carousel-track h-full',
    this.transition() === 'slide' && 'flex transition-transform duration-600 ease-in-out',
    this.transition() === 'crossfade' && 'relative w-full'
  ));

  getSlideClass(i: number) {
    return cn(
      'carousel-item h-full shrink-0 flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-800 transition-all duration-600 ease-in-out',
      this.transition() === 'slide' && 'relative',
      this.transition() === 'crossfade' && 'absolute inset-0 transition-opacity',
      i === this.activeIndex() && 'opacity-100 z-10',
      this.transition() === 'crossfade' && i !== this.activeIndex() && 'opacity-0 z-0 pointer-events-none'
    );
  }

  private destroy$ = new Subject<void>();
  private platformId = inject(PLATFORM_ID);
  private timerSubscription?: Subscription;

  private startX: number | null = null;
  private threshold = 50;

  ngAfterContentInit() {
    this.updateActiveItem();
    this.startAutoplay();

    // items is a signal, so it's handled properly by updateActiveItem/getActiveInterval on access
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopAutoplay();
  }

  next() {
    const total = this.items().length > 0 ? this.items().length : this.slides()?.length || 0;
    if (total === 0) return;

    const nextIndex = this.activeIndex() + 1;
    if (nextIndex < total) {
      this.select(nextIndex, 'next');
    } else if (this.wrap()) {
      this.select(0, 'next');
    }
  }

  prev() {
    const total = this.items().length > 0 ? this.items().length : this.slides()?.length || 0;
    if (total === 0) return;

    const prevIndex = this.activeIndex() - 1;
    if (prevIndex >= 0) {
      this.select(prevIndex, 'prev');
    } else if (this.wrap()) {
      this.select(total - 1, 'prev');
    }
  }

  select(index: number, direction?: 'next' | 'prev') {
    const activeIndex = this.activeIndex();
    if (index === activeIndex) return;

    this.direction.set(direction || (index > activeIndex ? 'next' : 'prev'));
    this.activeIndex.set(index);
    this.updateActiveItem();
    this.itemChange.emit(index);
    this.restartAutoplay();
  }

  private updateActiveItem() {
    if (this.items() && this.items().length > 0) {
      this.items().forEach((item, index) => {
        item.active.set(index === this.activeIndex());
      });
    }
  }

  startAutoplay() {
    if (!isPlatformBrowser(this.platformId) || this.interval() <= 0) return;

    this.stopAutoplay();
    const currentInterval = this.getActiveInterval();
    if (currentInterval <= 0) return;

    this.timerSubscription = timer(currentInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.next();
        this.startAutoplay();
      });
  }

  stopAutoplay() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }

  restartAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }

  private getActiveInterval(): number {
    if (this.items() && this.items().length > 0) {
      const activeItem = this.items()[this.activeIndex()];
      const interval = activeItem?.interval();
      return interval && interval > 0 ? interval : this.interval();
    }
    return this.interval();
  }

  onMouseEnter() {
    if (this.pause() === 'hover') {
      this.stopAutoplay();
    }
  }

  onMouseLeave() {
    if (this.pause() === 'hover') {
      this.startAutoplay();
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (!this.touch()) return;
    this.startX = event.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (!this.touch() || this.startX === null) return;

    const endX = event.changedTouches[0].clientX;
    const deltaX = endX - this.startX;
    this.startX = null;

    const rtl = this.writingDirection() === 'rtl';
    if ((rtl ? deltaX < -this.threshold : deltaX > this.threshold)) {
      this.prev();
    } else if ((rtl ? deltaX > this.threshold : deltaX < -this.threshold)) {
      this.next();
    }
  }
}
