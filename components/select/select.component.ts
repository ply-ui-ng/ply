import { Component,
  computed,
  forwardRef,
  input,
  signal,
  viewChild,
  ElementRef,
  afterEveryRender,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { cn } from '../tw-merge/tw-merge';

/**
 * A native HTML `<select>` wrapper component. Bind `[(ngModel)]` or `formControlName`.
 *
 * @example
 * <ply-select [(ngModel)]="selectedValue" placeholder="Select an option">
 *   <option value="1">Option 1</option>
 * </ply-select>
 */
@Component({
  selector: 'ply-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  templateUrl: './select.component.html',
  host: { '[class]': 'hostCls()' },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true }]
})
export class SelectComponent implements ControlValueAccessor {
  readonly extraClass   = input('', { alias: 'class' });
  readonly placeholder  = input('');
  readonly size = input<'sm' | 'md' | 'default' | 'lg' | 'xl'>('default');

  protected readonly sizeKey = computed(() => {
    const s = this.size();
    return s === 'md' ? 'default' : s;
  });

  protected readonly hostCls = computed(() => cn('relative block', this.extraClass()));

  /** Whether the control is disabled (consumer-facing input). */


  readonly disabled = input(false, { transform: booleanAttribute });


  /** Disabled state applied by Angular Forms via `setDisabledState`. */


  private readonly formDisabled = signal(false);


  /** Effective disabled state: consumer `disabled` input OR forms-disabled. */


  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());


  /** Current selection; template-read, so it must be a signal. */
  readonly value = signal<unknown>(undefined);
  private readonly nativeSelect = viewChild<ElementRef<HTMLSelectElement>>('nativeSelect');
  private onChange: (v: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    afterEveryRender(() => this.syncNativeValue());
  }

  onSelectChange(e: Event) {
    const next = (e.target as HTMLSelectElement).value;
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
  }

  writeValue(v: unknown) {
    this.value.set(v);
    this.syncNativeValue();
  }
  registerOnChange(fn: (v: unknown) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void)        { this.onTouched = fn; }
  setDisabledState(d: boolean)             { this.formDisabled.set(d); }

  /**
   * Native selects ignore `[value]` until projected `<option>` nodes exist.
   * Re-apply after each render so ng-content options can match.
   */
  private syncNativeValue(): void {
    const el = this.nativeSelect()?.nativeElement;
    if (!el) return;
    const raw = this.value();
    const next = raw == null ? '' : String(raw);
    if (el.value !== next) {
      el.value = next;
    }
  }
}
