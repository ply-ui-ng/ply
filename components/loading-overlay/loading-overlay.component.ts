import {
  Component,
  OnDestroy,
  PLATFORM_ID,
  ChangeDetectionStrategy,
  computed,
  effect,
  inject,
  input,
  booleanAttribute,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SpinnerComponent } from '../spinner/spinner.component';
import { cn } from '../tw-merge/tw-merge';
import { SpinnerColor, SpinnerSize } from '../types';

/**
 * Blocks a region (or the viewport) with a spinner while work is in progress.
 * Prefer this over `ply-spinner-wrapper` when you need a message, `aria-busy`,
 * optional scroll locking, or a fullscreen cover.
 *
 * @example
 * <ply-loading-overlay [visible]="saving()" message="Saving…">
 *   <form>…</form>
 * </ply-loading-overlay>
 */
@Component({
  selector: 'ply-loading-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpinnerComponent],
  templateUrl: './loading-overlay.component.html',
  host: {
    '[class]': 'hostCls()',
    '[attr.aria-busy]': 'visible() ? true : null',
  },
})
export class LoadingOverlayComponent implements OnDestroy {
  private readonly isSsrSafeBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private previousOverflow = '';
  private locked = false;

  /**
   * Extra host classes merged via `cn()`.
   * @example
   * <ply-loading-overlay class="min-h-64" [visible]="true"></ply-loading-overlay>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Shows the blocking overlay.
   * @example
   * <ply-loading-overlay [visible]="loading()"></ply-loading-overlay>
   */
  readonly visible = input(false, { transform: booleanAttribute });

  /**
   * Cover the viewport instead of wrapping projected content.
   * @example
   * <ply-loading-overlay visible fullscreen></ply-loading-overlay>
   */
  readonly fullscreen = input(false, { transform: booleanAttribute });

  /**
   * Set `overflow: hidden` on `document.body` while visible (typical for fullscreen).
   * @example
   * <ply-loading-overlay visible fullscreen lockScroll></ply-loading-overlay>
   */
  readonly lockScroll = input(false, { transform: booleanAttribute });

  /**
   * Optional status text announced via a live region.
   * @example
   * <ply-loading-overlay visible message="Loading invoices…"></ply-loading-overlay>
   */
  readonly message = input('');

  /**
   * Spinner diameter.
   * @example
   * <ply-loading-overlay visible size="lg"></ply-loading-overlay>
   */
  readonly size = input<SpinnerSize>('lg');

  /**
   * Spinner color. Use `inverted` on a dark backdrop.
   * @example
   * <ply-loading-overlay visible color="primary"></ply-loading-overlay>
   */
  readonly color = input<SpinnerColor>('primary');

  protected readonly hostCls = computed(() =>
    cn(this.fullscreen() ? 'contents' : 'relative block', this.extraClass()),
  );

  constructor() {
    effect(() => {
      this.syncBodyScroll(this.visible() && (this.lockScroll() || this.fullscreen()));
    });
  }

  ngOnDestroy(): void {
    this.syncBodyScroll(false);
  }

  private syncBodyScroll(lock: boolean): void {
    if (!this.isSsrSafeBrowser) return;
    if (lock && !this.locked) {
      this.previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      this.locked = true;
    } else if (!lock && this.locked) {
      document.body.style.overflow = this.previousOverflow;
      this.previousOverflow = '';
      this.locked = false;
    }
  }
}
