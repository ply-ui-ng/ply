import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { cn } from '../tw-merge/tw-merge';

let floatingInputIdCounter = 0;

/**
 * A specialized input component that features a floating label.
 *
 * @example
 * <ply-floating-input label="Email Address" type="email" [(ngModel)]="email"></ply-floating-input>
 */
@Component({
  selector: 'ply-floating-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FloatingInputComponent),
      multi: true
    }
  ],
  host: { '[class]': 'hostCls()' },
  templateUrl: './floating-input.component.html'
})
export class FloatingInputComponent implements ControlValueAccessor {
  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() => cn('block w-full', this.extraClass()));

  readonly label = input<string>('Label');
  readonly type = input<string>('text');

  readonly inputId = `ply-floating-input-${++floatingInputIdCounter}`;
  value = signal<string>('');
  isDisabled = signal<boolean>(false);

  onChange: (value: string) => void = () => undefined;
  onTouched: () => void = () => undefined;

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  writeValue(val: string): void {
    this.value.set(val || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
