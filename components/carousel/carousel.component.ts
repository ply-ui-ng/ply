import { AfterViewInit, Component, OnDestroy, computed, input, viewChild, ElementRef, signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { cn } from '../tw-merge/tw-merge';

/**
 * A horizontally scrollable carousel with drag-to-scroll and touch swipe.
 *
 * @example
 * <ply-horizontal-carousel title="Featured">
 *   <div class="w-16 h-16">Item</div>
 * </ply-horizontal-carousel>
 */
@Component({
  selector: 'ply-horizontal-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, IconButtonDirective],
  templateUrl: './carousel.component.html',
  host: { '[class]': 'hostCls()' },
})
export class HorizontalCarouselComponent implements AfterViewInit, OnDestroy {
  readonly extraClass = input('', { alias: 'class' });
  readonly title      = input('');

  protected readonly hostCls = computed(() => cn('block w-full', this.extraClass()));

  readonly track = viewChild<ElementRef<HTMLDivElement>>('track');

  // Signals: written from the ResizeObserver/scroll callbacks outside template
  // event handlers, so they must be signals under zoneless change detection.
  readonly canScrollPrev = signal(false);
  readonly canScrollNext = signal(true);
  readonly isDragging = signal(false);

  protected readonly trackCls = computed(() =>
    cn(
      'grid grid-flow-col auto-cols-[calc((100%-16px)/2)] sm:auto-cols-[calc((100%-32px)/3)] md:auto-cols-[calc((100%-48px)/4)] lg:auto-cols-[calc((100%-64px)/5)] gap-4 overflow-x-auto pb-2 *:snap-start [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
      !this.isDragging() && 'snap-x snap-mandatory',
    ),
  );
  private startX = 0;
  private scrollLeftPos = 0;
  private touchStartX = 0;
  private touchEndX   = 0;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit() {
    this.checkScroll();
    const el = this.track()?.nativeElement;
    if (typeof window !== 'undefined' && window.ResizeObserver && el) {
      this.resizeObserver = new ResizeObserver(() => this.checkScroll());
      this.resizeObserver.observe(el);
    }
  }

  ngOnDestroy() { this.resizeObserver?.disconnect(); }

  onScroll() { this.checkScroll(); }

  checkScroll() {
    const el = this.track()?.nativeElement;
    if (!el) return;
    this.canScrollPrev.set(el.scrollLeft > 2);
    this.canScrollNext.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }

  scrollNext() {
    if (!this.canScrollNext()) return;
    const el = this.track()?.nativeElement;
    const child = el?.firstElementChild as HTMLElement;
    if (el && child) el.scrollBy({ left: child.offsetWidth + 16, behavior: 'smooth' });
  }

  scrollPrev() {
    if (!this.canScrollPrev()) return;
    const el = this.track()?.nativeElement;
    const child = el?.firstElementChild as HTMLElement;
    if (el && child) el.scrollBy({ left: -(child.offsetWidth + 16), behavior: 'smooth' });
  }

  onMouseDown(e: MouseEvent) {
    const el = this.track()?.nativeElement;
    if (!el) return;
    this.isDragging.set(true);
    el.classList.add('cursor-grabbing');
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeftPos = el.scrollLeft;
  }

  onMouseLeave() {
    this.isDragging.set(false);
    this.track()?.nativeElement.classList.remove('cursor-grabbing');
  }

  onMouseUp() {
    this.isDragging.set(false);
    this.track()?.nativeElement.classList.remove('cursor-grabbing');
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDragging()) return;
    const el = this.track()?.nativeElement;
    if (!el) return;
    e.preventDefault();
    el.scrollLeft = this.scrollLeftPos - (e.pageX - el.offsetLeft - this.startX) * 1.5;
  }

  onTouchStart(e: TouchEvent) {
    if (e.changedTouches.length > 0) this.touchStartX = e.changedTouches[0].screenX;
  }

  onTouchEnd(e: TouchEvent) {
    if (e.changedTouches.length > 0) {
      this.touchEndX = e.changedTouches[0].screenX;
      const diff = this.touchStartX - this.touchEndX;
      if (Math.abs(diff) > 50) { diff > 0 ? this.scrollNext() : this.scrollPrev(); }
    }
  }
}
