
import { Component, forwardRef, input, signal, computed ,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { SliderColor } from "../types";

@Component({
  selector: 'ply-range-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './range-slider.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeSliderComponent),
      multi: true
}]
})
export class RangeSliderComponent implements ControlValueAccessor {
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly color = input<SliderColor>('primary');
  /** Whether the control is disabled (consumer-facing input). */

  readonly disabled = input(false, { transform: booleanAttribute });

  /** Disabled state applied by Angular Forms via `setDisabledState`. */

  private readonly formDisabled = signal(false);

  /** Effective disabled state: consumer `disabled` input OR forms-disabled. */

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  readonly showValue = input(false, { transform: booleanAttribute });
  readonly showMinMax = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('Slider');

  readonly value = signal(0);
  private onChange: (value: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly trackClasses = computed(() => {
    const base = 'w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-default focus:outline-none range-thumb';
    const colorMap: Record<SliderColor, string> = {
      'primary': 'accent-blue-500',
      'success': 'accent-green-500',
      'danger': 'accent-red-500',
      'warning': 'accent-orange-500',
      'accent': 'accent-purple-500'
};
    return `${base} ${colorMap[this.color()]}`;
  });

  readonly fillPercent = computed(() => {
    const max = this.max();
    const min = this.min();
    if (max === min) return 0;
    return ((this.value() - min) / (max - min)) * 100;
  });

  getValueLabel(): string {
    if (Number.isInteger(this.value())) return String(this.value());
    return this.value().toFixed(1);
  }

  onValueChange(val: number) {
    this.value.set(val);
    this.onChange(this.value());
    this.onTouched();
  }

  writeValue(val: unknown): void {
    this.value.set(Number(val) || 0);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
