import { CommonModule } from '@angular/common';
import { Component, forwardRef, input, model, computed ,
  signal,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { CheckboxColor } from "../types";
import { cn } from '../tw-merge/tw-merge';

/**
 * A custom styled checkbox component that integrates seamlessly with Angular Forms.
 * Supports ngModel and reactive forms via ControlValueAccessor.
 * 
 * @example
 * <ply-checkbox [(ngModel)]="agree" color="primary">I agree to the terms</ply-checkbox>
 */
@Component({
  selector: 'ply-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, FormsModule],
  templateUrl: './checkbox.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
}]
})
export class CheckboxComponent implements ControlValueAccessor {
  /** The semantic visual color. Defaults to 'primary'. */
  readonly color = input<CheckboxColor>('primary');
  
  /** Disables the checkbox. Can also be set via Angular Forms. */
  /** Whether the control is disabled (consumer-facing input). */

  readonly disabled = input(false, { transform: booleanAttribute });

  /** Disabled state applied by Angular Forms via `setDisabledState`. */

  private readonly formDisabled = signal(false);

  /** Effective disabled state: consumer `disabled` input OR forms-disabled. */

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  
  /** The checked state of the checkbox. Bound via ngModel. */
  readonly checked = model(false);

  /**
   * Marks the checkbox as visually/semantically indeterminate (mixed) state,
   * e.g. for a "select all" checkbox when only some items are selected.
   * Defaults to false.
   *
   * @example
   * <ply-checkbox [checked]="allSelected" [indeterminate]="someSelected"></ply-checkbox>
   */
  readonly indeterminate = input(false, { transform: booleanAttribute });

  /**
   * Optional accessible name applied directly to the native `<input>`.
   * Use this instead of `[attr.aria-label]` on `<ply-checkbox>` itself —
   * the host element isn't the focusable/interactive part, so an attribute
   * bound to the host would never reach assistive tech.
   *
   * @example
   * <ply-checkbox [ariaLabel]="'Select ' + row.name"></ply-checkbox>
   */
  readonly ariaLabel = input<string | undefined>(undefined);

  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly checkboxClasses = computed(() => {
    return cn(
      'w-4 min-w-4 max-w-4 h-4 appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 disabled:hover:border-slate-300 dark:disabled:hover:border-slate-600 disabled:opacity-50 mr-2 rounded cursor-pointer peer mt-1 disabled:hover:cursor-default disabled:checked:cursor-default',
      {
        'checked:bg-blue-500 checked:border-blue-500 checked:hover:border-blue-600 indeterminate:bg-blue-500 indeterminate:border-blue-500 indeterminate:hover:border-blue-600': this.color() === 'primary',
        'checked:bg-red-500 checked:border-red-500 checked:hover:border-red-600 indeterminate:bg-red-500 indeterminate:border-red-500 indeterminate:hover:border-red-600': this.color() === 'danger',
        'checked:bg-green-500 checked:border-green-500 checked:hover:border-green-600 indeterminate:bg-green-500 indeterminate:border-green-500 indeterminate:hover:border-green-600': this.color() === 'success',
        'checked:bg-purple-500 checked:border-purple-500 checked:hover:border-purple-600 indeterminate:bg-purple-500 indeterminate:border-purple-500 indeterminate:hover:border-purple-600': this.color() === 'accent',
        'checked:bg-orange-500 checked:border-orange-500 checked:hover:border-orange-600 indeterminate:bg-orange-500 indeterminate:border-orange-500 indeterminate:hover:border-orange-600': this.color() === 'warning'
      }
    );
  });

  onToggle(event: Event) {
    const input = event.target as HTMLInputElement;
    this.checked.set(input.checked);
    this.onChange(this.checked());
    this.onTouched();
  }

  writeValue(value: unknown): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
