import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  forwardRef,
  input,
  signal,
  untracked,
  booleanAttribute,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cn } from '../tw-merge/tw-merge';

/**
 * Locale-aware currency field. Stores a `number | null` via Angular forms.
 * Shows a formatted value when idle and a raw editable amount while focused.
 * Do not nest inside `ply-input-group` — it is a composite control.
 *
 * @example
 * <ply-currency-input [(ngModel)]="price" currency="USD"></ply-currency-input>
 */
@Component({
  selector: 'ply-currency-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './currency-input.component.html',
  host: { '[class]': 'hostCls()' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputComponent),
      multi: true,
    },
  ],
})
export class CurrencyInputComponent implements ControlValueAccessor {
  /**
   * Extra host classes merged via `cn()`.
   * @example
   * <ply-currency-input class="max-w-xs"></ply-currency-input>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * ISO 4217 currency code used for formatting and the prefix symbol.
   * @example
   * <ply-currency-input currency="EUR"></ply-currency-input>
   */
  readonly currency = input('USD');

  /**
   * BCP 47 locale passed to `Intl.NumberFormat`. Defaults to `en-US`.
   * @example
   * <ply-currency-input locale="de-DE" currency="EUR"></ply-currency-input>
   */
  readonly locale = input('en-US');

  /**
   * Placeholder shown when the value is empty and the field is not focused.
   * @example
   * <ply-currency-input placeholder="0.00"></ply-currency-input>
   */
  readonly placeholder = input('0.00');

  /**
   * Accessible name for the inner text field.
   * @example
   * <ply-currency-input ariaLabel="Amount"></ply-currency-input>
   */
  readonly ariaLabel = input('Amount');

  /**
   * Minimum allowed value (applied on blur). Omit for no floor.
   * @example
   * <ply-currency-input [min]="0"></ply-currency-input>
   */
  readonly min = input<number | null>(null);

  /**
   * Maximum allowed value (applied on blur). Omit for no ceiling.
   * @example
   * <ply-currency-input [max]="1000000"></ply-currency-input>
   */
  readonly max = input<number | null>(null);

  /**
   * Hide the currency symbol prefix (the formatted value still uses the currency).
   * @example
   * <ply-currency-input [showSymbol]="false"></ply-currency-input>
   */
  readonly showSymbol = input(true, { transform: booleanAttribute });

  readonly displayText = signal('');
  readonly focused = signal(false);
  readonly disabled = signal(false);
  private numericValue: number | null = null;

  private onChange: (value: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected readonly hostCls = computed(() => cn('block w-full', this.extraClass()));

  constructor() {
    effect(() => {
      this.locale();
      this.currency();
      this.showSymbol();
      if (untracked(() => this.focused())) return;
      this.displayText.set(this.format(this.numericValue));
    });
  }

  protected readonly symbol = computed(() => {
    try {
      const parts = new Intl.NumberFormat(this.locale(), {
        style: 'currency',
        currency: this.currency(),
      }).formatToParts(0);
      return parts.find((p) => p.type === 'currency')?.value ?? this.currency();
    } catch {
      return this.currency();
    }
  });

  writeValue(value: number | null): void {
    const n = this.coerceNumber(value);
    this.numericValue = n;
    if (!this.focused()) this.displayText.set(this.format(n));
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  /** @example // Bound on the input `(focus)` */
  onFocus(): void {
    this.focused.set(true);
    this.displayText.set(this.rawForEdit(this.numericValue));
  }

  /** @example // Bound on the input `(blur)` */
  onBlur(): void {
    this.focused.set(false);
    this.onTouched();
    const next = this.clamp(this.parse(this.displayText()));
    this.numericValue = next;
    this.displayText.set(this.format(next));
    this.onChange(next);
  }

  /** @example // Bound on the input `(input)` */
  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.displayText.set(raw);
    const n = this.parse(raw);
    this.numericValue = n;
    this.onChange(n);
  }

  private coerceNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : null;
  }

  private parse(raw: string): number | null {
    const { decimal, group, groupSize } = this.numberSymbols();
    let cleaned = raw.trim();
    if (!cleaned) return null;

    if (decimal && cleaned.includes(decimal)) {
      if (group) cleaned = cleaned.split(group).join('');
      if (decimal !== '.') cleaned = cleaned.split(decimal).join('.');
    } else if (group) {
      cleaned = this.normalizeGroupedInput(cleaned, group, groupSize);
    }

    cleaned = cleaned.replace(/[^\d.eE+-]/g, '');
    if (!cleaned || cleaned === '-' || cleaned === '.' || cleaned === '-.' || cleaned === '+') {
      return null;
    }
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  /**
   * Strip group separators only when every group after the first is complete
   * (e.g. `1.500` → `1500` in `de-DE`). A trailing incomplete group such as
   * `1.5` / `1.50` is treated as a decimal so `onChange` does not emit `15` / `150`.
   */
  private normalizeGroupedInput(raw: string, group: string, groupSize: number): string {
    const parts = raw.split(group);
    if (parts.length < 2) return raw;

    const firstHasDigits = /\d/.test(parts[0]);
    const restComplete = parts
      .slice(1)
      .every((part) => /^\d+$/.test(part) && part.length === groupSize);

    if (firstHasDigits && restComplete) {
      return parts.join('');
    }

    return `${parts.slice(0, -1).join('')}.${parts[parts.length - 1]}`;
  }

  private numberSymbols(): { decimal: string; group: string; groupSize: number } {
    try {
      const parts = new Intl.NumberFormat(this.locale()).formatToParts(1234567.89);
      const integers: string[] = [];
      for (const part of parts) {
        if (part.type === 'decimal') break;
        if (part.type === 'integer') integers.push(part.value);
      }
      return {
        decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
        group: parts.find((p) => p.type === 'group')?.value ?? '',
        groupSize: integers.length > 1 ? integers[integers.length - 1].length : 3,
      };
    } catch {
      return { decimal: '.', group: ',', groupSize: 3 };
    }
  }

  private clamp(n: number | null): number | null {
    if (n === null) return null;
    const min = this.min();
    const max = this.max();
    let next = n;
    if (min !== null && next < min) next = min;
    if (max !== null && next > max) next = max;
    return next;
  }

  private format(n: number | null): string {
    if (n === null) return '';
    try {
      // Always format as a plain decimal: the symbol prefix is rendered by the
      // template's `symbol()` span when `showSymbol()` is true. Embedding the
      // currency here would show the symbol even when the prefix is hidden.
      const digits = this.fractionDigits();
      return new Intl.NumberFormat(this.locale(), {
        style: 'decimal',
        ...digits,
      }).format(n);
    } catch {
      return String(n);
    }
  }

  private fractionDigits(): { minimumFractionDigits: number; maximumFractionDigits: number } {
    try {
      const resolved = new Intl.NumberFormat(this.locale(), {
        style: 'currency',
        currency: this.currency(),
      }).resolvedOptions();
      return {
        minimumFractionDigits: resolved.minimumFractionDigits ?? 2,
        maximumFractionDigits: resolved.maximumFractionDigits ?? 2,
      };
    } catch {
      return { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    }
  }

  private rawForEdit(n: number | null): string {
    if (n === null) return '';
    return String(n);
  }
}
