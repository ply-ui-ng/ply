import { AfterViewInit, Component, input, contentChild, computed ,
  ChangeDetectionStrategy
} from '@angular/core';
import { DialogBodyComponent } from '../dialog-body/dialog-body.component';
import { injectTimers } from '../../safe-timer/safe-timer';

/**
 * Turn a `width` input into a CSS size.
 * Template attributes are always strings (`width="400"`), so a bare number
 * must become `400px` — unitless CSS width is invalid and the overlay
 * flex layout then stretches the dialog to the viewport.
 */
function cssWidth(width: number | string | undefined | null): string | null {
  if (width == null || width === '') return null;
  if (typeof width === 'number') {
    return Number.isFinite(width) ? `${width}px` : null;
  }
  const trimmed = width.trim();
  if (!trimmed) return null;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
  return trimmed;
}

/**
 * The main wrapper component for dialog/modal content.
 * Should be used inside a component that is passed to `DialogService.open()`.
 * 
 * @example
 * <ply-dialog [width]="600">
 *   <ply-dialog-header>Title</ply-dialog-header>
 *   <ply-dialog-body>Content here</ply-dialog-body>
 *   <ply-dialog-footer>Buttons here</ply-dialog-footer>
 * </ply-dialog>
 */
@Component({
  selector: 'ply-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './dialog.component.html',
  host: {
    class: 'block w-fit max-w-full',
    '[style.width]': 'widthStyle()',
  },
})
export class DialogComponent implements AfterViewInit {
  /** Timers cancelled automatically on destroy — see utils/safe-timer. */
  private readonly timers = injectTimers();
  /** Explicit width: pixels as a number or any CSS width string (e.g. `'640'`, `'48rem'`). */
  readonly width = input<number | string>();

  /** Resolved CSS width, or `null` to size to content instead of stretching. */
  protected readonly widthStyle = computed(() => cssWidth(this.width()));
  
  /** Explicit height in pixels. Applied dynamically to the `ply-dialog-body` for scrolling. */
  readonly height = input<number>();
  
  readonly bodyComponent = contentChild(DialogBodyComponent);

  ngAfterViewInit(): void {
    if (this.bodyComponent() && this.height()) {
      this.timers.setTimeout(() => {
        const bodyComponent = this.bodyComponent();
        if (bodyComponent) {
          bodyComponent.height.set(this.height());
        }
      });
    }
  }
}
