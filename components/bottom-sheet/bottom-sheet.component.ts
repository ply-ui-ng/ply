import { Component,
  ChangeDetectionStrategy,
  DestroyRef,
  HostListener,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal, booleanAttribute } from '@angular/core';

import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { trigger, transition, style, animate } from '@angular/animations';
import { IconComponent } from '../icon/icon.component';
import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { slideBottom } from '../animations/animations';
import { cn } from '../tw-merge/tw-merge';
import { BottomSheetHeight } from '../types';

const DRAG_CLOSE_THRESHOLD = 120; // px dragged down before auto-close
const DRAG_VELOCITY_THRESHOLD = 0.5; // px/ms — fast flick closes even if threshold not reached

const fade = trigger('fade', [
  transition(':enter', [style({ opacity: 0 }), animate('200ms ease-out', style({ opacity: 1 }))]),
  transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))])]);

/**
 * A mobile-style panel that slides up from the bottom of the screen.
 * Supports swipe-down-to-dismiss via the drag handle, a configurable height,
 * and traps focus while open.
 *
 * @example
 * <ply-bottom-sheet [(open)]="isOpen" height="half" (closed)="onClosed()">
 *   <h3 class="text-lg font-semibold mb-3">Filter Results</h3>
 *   <p>Sheet content here</p>
 * </ply-bottom-sheet>
 */
@Component({
  selector: 'ply-bottom-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [A11yModule, IconComponent, IconButtonDirective],
  templateUrl: './bottom-sheet.component.html',
  host: { '[class]': 'hostCls()' },
  animations: [slideBottom, fade],
})
export class BottomSheetComponent {
  readonly extraClass = input('', { alias: 'class' });

  /** Two-way bindable open state. */
  readonly open = model(false);

  /** Sheet height. Defaults to 'auto'. */
  readonly height = input<BottomSheetHeight>('auto');

  /** Shows the drag handle bar at the top. Defaults to true. */
  readonly showHandle = input(true, { transform: booleanAttribute });

  /** Shows a close (X) button in the top-right corner. Defaults to false. */
  readonly showClose = input(false, { transform: booleanAttribute });

  /** Accessible name for the bottom sheet dialog. */
  readonly sheetLabel = input('Bottom sheet');

  /** Whether the backdrop click, swipe-down gesture, or Escape key can dismiss the sheet. Defaults to true. */
  readonly dismissible = input(true, { transform: booleanAttribute });

  /** Emitted when the sheet closes, regardless of how it was triggered. */
  readonly closed = output<void>();

  protected readonly hostCls = computed(() => cn('contents', this.extraClass()));

  protected readonly heightClass = computed(() => {
    switch (this.height()) {
      case 'auto': return 'max-h-[85vh]';
      case 'half': return 'h-[50vh]';
      case 'full': return 'h-[94vh]';
      default:     return '';
    }
  });

  protected readonly customHeightStyle = computed(() => {
    const h = this.height();
    return h === 'auto' || h === 'half' || h === 'full' ? null : h;
  });

  protected readonly dragOffset = signal(0);
  protected readonly isDragging = signal(false);

  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private dragStartY = 0;
  private dragStartTime = 0;

  constructor() {
    // Lock body scroll while the sheet is open; always restore on destroy.
    // Uses the injected DOCUMENT (not the global) so this runs under server rendering.
    effect(() => {
      this.document.body.style.overflow = this.open() ? 'hidden' : '';
    });
    inject(DestroyRef).onDestroy(() => {
      this.document.body.style.overflow = '';
      if (!this.isBrowser) return;
      window.removeEventListener('pointermove', this.onDragMove);
      window.removeEventListener('pointerup', this.onDragEnd);
    });
  }

  close() {
    if (!this.dismissible()) return;
    this.open.set(false);
    this.closed.emit();
  }

  onBackdropClick() {
    this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.open()) this.close();
  }

  onDragStart(e: PointerEvent) {
    if (!this.dismissible()) return;
    this.isDragging.set(true);
    this.dragStartY = e.clientY;
    this.dragStartTime = performance.now();
    window.addEventListener('pointermove', this.onDragMove);
    window.addEventListener('pointerup', this.onDragEnd);
  }

  private onDragMove = (e: PointerEvent) => {
    this.dragOffset.set(Math.max(0, e.clientY - this.dragStartY));
  };

  private onDragEnd = () => {
    window.removeEventListener('pointermove', this.onDragMove);
    window.removeEventListener('pointerup', this.onDragEnd);
    this.isDragging.set(false);

    const elapsed = performance.now() - this.dragStartTime;
    const velocity = this.dragOffset() / Math.max(elapsed, 1);

    if (this.dragOffset() > DRAG_CLOSE_THRESHOLD || velocity > DRAG_VELOCITY_THRESHOLD) {
      this.dragOffset.set(0);
      this.close();
    } else {
      this.dragOffset.set(0);
    }
  };
}
