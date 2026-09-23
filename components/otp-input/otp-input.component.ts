import { Component,
  OnChanges,
  computed,
  forwardRef,
  input,

  output,
  signal,
  viewChildren,
  ElementRef,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { inlineArrowDelta } from '../direction/direction';
import { injectElementDirection } from '../direction/inject-direction';
import { cn } from '../tw-merge/tw-merge';

/**
 * A PIN / OTP input component with individually-focusable digit boxes.
 * Integrates with Angular Forms via ControlValueAccessor.
 *
 * @example
 * <ply-otp-input [length]="6" (completed)="onVerify($event)"></ply-otp-input>
 */
@Component({
  selector: 'ply-otp-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './otp-input.component.html',
  host: { '[class]': 'hostCls()' },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => OtpInputComponent), multi: true }]
})
export class OtpInputComponent implements ControlValueAccessor, OnChanges {
  private readonly writingDirection = injectElementDirection();
  readonly extraClass   = input('', { alias: 'class' });
  readonly length       = input(6);
  readonly mask = input(false, { transform: booleanAttribute });
  readonly numbersOnly = input(true, { transform: booleanAttribute });

  /** Emitted when all boxes are filled with the full code string. */
  readonly completed = output<string>();

  readonly boxes = viewChildren<ElementRef<HTMLInputElement>>('otpBox');

  protected readonly hostCls = computed(() => cn('flex gap-2', this.extraClass()));

  /** Whether the control is disabled (consumer-facing input). */


  readonly disabled = input(false, { transform: booleanAttribute });


  /** Disabled state applied by Angular Forms via `setDisabledState`. */


  private readonly formDisabled = signal(false);


  /** Effective disabled state: consumer `disabled` input OR forms-disabled. */


  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());


  /** One entry per digit box; template-read, so it must be a signal. */
  readonly digits = signal<string[]>([]);
  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  ngOnChanges() {
    this.digits.set(Array.from({ length: this.length() }, () => ''));
  }

  readonly boxArray = computed<number[]>(() => {
    return Array.from({ length: this.length() }, (_, i) => i);
  });

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    let val = input.value;
    if (this.numbersOnly()) val = val.replace(/\D/g, '');
    val = val.slice(-1);
    this.setDigit(index, val);
    input.value = val;
    if (val && index < this.length() - 1) this.focusBox(index + 1);
    this.emit();
  }

  onKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (this.digits()[index]) {
        this.setDigit(index, '');
        const el = this.boxes()[index]?.nativeElement;
        if (el) el.value = '';
        this.emit();
      }
      if (index > 0) this.focusBox(index - 1);
      return;
    }
    const step = inlineArrowDelta(event.key, this.writingDirection());
    if (step) this.focusBox(Math.min(this.length() - 1, Math.max(0, index + step)));
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    let paste = event.clipboardData?.getData('text') ?? '';
    if (this.numbersOnly()) paste = paste.replace(/\D/g, '');
    paste = paste.slice(0, this.length());
    this.digits.set(Array.from({ length: this.length() }, (_, i) => paste[i] ?? ''));
    this.emit();
    this.focusBox(Math.min(paste.length, this.length() - 1));
  }

  /** Replace one digit immutably so the signal notifies the template. */
  private setDigit(index: number, value: string) {
    this.digits.update((digits) => {
      const next = [...digits];
      next[index] = value;
      return next;
    });
  }

  private focusBox(index: number) {
    const box = this.boxes()[index]?.nativeElement;
    if (!box) return;
    box.focus();
    requestAnimationFrame(() => box.select());
  }

  private emit() {
    const value = this.digits().join('');
    this.onChange(value);
    this.onTouched();
    if (value.length === this.length() && this.digits().every(d => d !== '')) {
      this.completed.emit(value);
    }
  }

  writeValue(val: string): void {
    const chars = (val ?? '').split('').slice(0, this.length());
    this.digits.set(Array.from({ length: this.length() }, (_, i) => chars[i] ?? ''));
  }

  registerOnChange(fn: (v: string) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(d: boolean) { this.formDisabled.set(d); }
}
