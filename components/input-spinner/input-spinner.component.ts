import { Component,
  computed,
  forwardRef,
  input,

  signal,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { cn } from '../tw-merge/tw-merge';

/**
 * A numeric input component with increment and decrement buttons.
 *
 * @example
 * <ply-input-spinner [(ngModel)]="quantity" [min]="1" [max]="10"></ply-input-spinner>
 */
@Component({
  selector: 'ply-input-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IconComponent, IconButtonDirective],
  templateUrl: './input-spinner.component.html',
  host: { '[class]': 'hostCls()' },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputSpinnerComponent), multi: true }]
})
export class InputSpinnerComponent implements ControlValueAccessor {
  readonly extraClass = input('', { alias: 'class' });
  readonly classes    = input('');
  readonly min        = input(0);
  readonly max        = input(Infinity);
  readonly step       = input(1);

  protected readonly hostCls = computed(() => cn('block', this.extraClass()));

  /** Whether the control is disabled (consumer-facing input). */


  readonly disabled = input(false, { transform: booleanAttribute });


  /** Disabled state applied by Angular Forms via `setDisabledState`. */


  private readonly formDisabled = signal(false);


  /** Effective disabled state: consumer `disabled` input OR forms-disabled. */


  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());


  /** Current numeric value; template-read, so it must be a signal. */
  readonly value = signal(0);
  private onChange: (v: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  updateValue(add: boolean) {
    if (this.isDisabled()) return;
    const next = this.value() + (add ? this.step() : -this.step());
    if (next >= this.min() && next <= this.max()) {
      this.value.set(next);
      this.onChange(next);
      this.onTouched();
    }
  }

  onInputChange(e: Event) {
    let n = Number((e.target as HTMLInputElement).value);
    if (!isNaN(n)) {
      n = Math.max(this.min(), Math.min(this.max(), n));
      this.value.set(n);
      this.onChange(n);
      this.onTouched();
    } else {
      (e.target as HTMLInputElement).value = String(this.value());
    }
  }

  writeValue(v: unknown) { this.value.set(typeof v === 'number' ? v : 0); }
  registerOnChange(fn: (v: number) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void)         { this.onTouched = fn; }
  setDisabledState(d: boolean)              { this.formDisabled.set(d); }
}
