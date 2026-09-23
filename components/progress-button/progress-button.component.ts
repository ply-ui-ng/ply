import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { ButtonColor, ButtonSize, SpinnerColor } from '../types';
import { cn } from '../tw-merge/tw-merge';

/** Maps a button color to a spinner color that stays visible on it. */
const SPINNER_COLOR_BY_BUTTON: Record<string, SpinnerColor> = {
  primary: 'primary',
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  accent: 'accent',
  black: 'inverted',
  white: 'primary',
  default: 'primary',
  transparent: 'primary',
};

/** Border-arc classes per spinner color. */
const SPINNER_COLOR_CLASSES: Record<SpinnerColor, string> = {
  primary: 'border-blue-500 border-t-blue-100 border-e-blue-100 border-b-blue-100',
  success: 'border-green-500 border-t-green-100 border-e-green-100 border-b-green-100',
  danger: 'border-red-500 border-t-red-100 border-e-red-100 border-b-red-100',
  warning: 'border-orange-500 border-t-orange-100 border-e-orange-100 border-b-orange-100',
  accent: 'border-purple-500 border-t-purple-100 border-e-purple-100 border-b-purple-100',
  inverted: 'border-white border-t-white/20 border-e-white/20 border-b-white/20',
};

/**
 * Spinner diameter in px per button size — 20px on the default `h-9`
 * button, proportional to the button height for the other sizes.
 */
const SPINNER_PX_BY_BUTTON: Record<ButtonSize, number> = {
  sm: 16,
  md: 20,
  default: 20,
  lg: 22,
  xl: 24,
  xxl: 32,
};

/**
 * A button with built-in progress state: while `loading` is true the label
 * fades out (keeping the button's width stable) and a centered spinner is
 * shown instead. Wraps `ply-button`, so every color and size is supported.
 *
 * @example
 * <ply-progress-button color="primary" [loading]="saving()" (clicked)="save()">
 *   Save changes
 * </ply-progress-button>
 */
@Component({
  selector: 'ply-progress-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseButtonDirective],
  templateUrl: './progress-button.component.html',
  host: { '[class]': 'hostCls()' },
})
export class ProgressButtonComponent {
  /**
   * Extra host classes merged via `cn()`.
   *
   * @example
   * <ply-progress-button class="w-full"></ply-progress-button>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Whether the progress spinner is shown and the button blocks
   * interaction. The button keeps its normal appearance while loading —
   * no disabled fade — it just swaps the label for the spinner.
   *
   * @example
   * <ply-progress-button [loading]="saving()">Save</ply-progress-button>
   */
  readonly loading = input(false);

  /**
   * The semantic visual color, forwarded to `ply-button`.
   *
   * @example
   * <ply-progress-button color="success">Save</ply-progress-button>
   */
  readonly color = input<ButtonColor>('primary');

  /**
   * The button size, forwarded to `ply-button`.
   *
   * @example
   * <ply-progress-button size="lg">Save</ply-progress-button>
   */
  readonly size = input<ButtonSize>('default');

  /**
   * Optional custom width (e.g. `'100%'`), forwarded to `ply-button`.
   *
   * @example
   * <ply-progress-button width="100%">Save</ply-progress-button>
   */
  readonly width = input<string>('');

  /**
   * Native button type.
   *
   * @example
   * <ply-progress-button type="submit">Save</ply-progress-button>
   */
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  /**
   * Whether the button is disabled.
   *
   * @example
   * <ply-progress-button [disabled]="true">Save</ply-progress-button>
   */
  readonly disabled = input(false);

  /**
   * Override the spinner color; by default it is derived from `color`.
   *
   * @example
   * <ply-progress-button spinnerColor="inverted">Save</ply-progress-button>
   */
  readonly spinnerColor = input<SpinnerColor | undefined>(undefined);

  /**
   * Emits when the button is clicked while enabled and not loading.
   *
   * @example
   * <ply-progress-button (clicked)="save()">Save</ply-progress-button>
   */
  readonly clicked = output<void>();

  protected readonly hostCls = computed(() => cn('inline-flex', this.extraClass()));

  protected readonly resolvedSpinnerColor = computed<SpinnerColor>(
    () => this.spinnerColor() ?? SPINNER_COLOR_BY_BUTTON[`${this.color()}`] ?? 'primary',
  );

  /** Spinner diameter in px: 20 on default size, proportional for the rest. */
  protected readonly spinnerPx = computed(() => SPINNER_PX_BY_BUTTON[this.size()] ?? 20);

  protected readonly spinnerBorderPx = computed(() => (this.spinnerPx() >= 32 ? 3 : 2));

  protected readonly spinnerCls = computed(() =>
    cn('animate-spin rounded-full border-solid', SPINNER_COLOR_CLASSES[this.resolvedSpinnerColor()]),
  );

  onClick(event: Event) {
    if (this.disabled() || this.loading()) {
      // Blocked while loading — also stop native form submission.
      event.preventDefault();
      return;
    }
    this.clicked.emit();
  }
}
