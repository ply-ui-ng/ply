import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

/** Pattern token characters that accept user input. */
const TOKEN_CHARS = new Set(['0', 'A', 'S']);

/**
 * Applies a simple input mask pattern to a raw string.
 *
 * Tokens:
 * - `0` — digit (`0-9`)
 * - `A` — letter (`a-zA-Z`)
 * - `S` — alphanumeric (`a-zA-Z0-9`)
 * - any other character — literal (inserted automatically)
 *
 * @param value Raw or partially masked user input
 * @param pattern Mask pattern, e.g. `(000) 000-0000`
 * @returns Masked display string
 *
 * @example
 * applyInputMask('5551234567', '(000) 000-0000'); // '(555) 123-4567'
 * applyInputMask('abcd1234', 'AAAA-0000'); // 'abcd-1234'
 */
export function applyInputMask(value: string, pattern: string): string {
  if (!pattern) {
    return value;
  }

  let result = '';
  let inputIndex = 0;

  for (const maskChar of pattern) {
    if (inputIndex >= value.length) {
      break;
    }

    if (maskChar === '0') {
      while (inputIndex < value.length && !/\d/.test(value[inputIndex])) {
        inputIndex++;
      }
      if (inputIndex >= value.length) {
        break;
      }
      result += value[inputIndex++];
    } else if (maskChar === 'A') {
      while (inputIndex < value.length && !/[a-zA-Z]/.test(value[inputIndex])) {
        inputIndex++;
      }
      if (inputIndex >= value.length) {
        break;
      }
      result += value[inputIndex++];
    } else if (maskChar === 'S') {
      while (inputIndex < value.length && !/[a-zA-Z0-9]/.test(value[inputIndex])) {
        inputIndex++;
      }
      if (inputIndex >= value.length) {
        break;
      }
      result += value[inputIndex++];
    } else {
      result += maskChar;
      if (value[inputIndex] === maskChar) {
        inputIndex++;
      }
    }
  }

  return result;
}

/**
 * Strips literal characters from a masked value, keeping only token slots.
 *
 * @param masked Masked display string
 * @param pattern Mask pattern used to produce `masked`
 * @returns Unmasked characters only
 *
 * @example
 * unmaskInputValue('(555) 123-4567', '(000) 000-0000'); // '5551234567'
 */
export function unmaskInputValue(masked: string, pattern: string): string {
  if (!pattern) {
    return masked;
  }

  let result = '';
  const len = Math.min(masked.length, pattern.length);

  for (let i = 0; i < len; i++) {
    if (TOKEN_CHARS.has(pattern[i])) {
      result += masked[i];
    }
  }

  return result;
}

/**
 * Maps caret position from a pre-mask value into the masked string.
 */
function mapCaretToMasked(
  oldValue: string,
  oldCaret: number,
  masked: string,
  pattern: string,
): number {
  let significantBefore = 0;
  for (let i = 0; i < oldCaret && i < oldValue.length; i++) {
    const ch = oldValue[i];
    if (/\d/.test(ch) || /[a-zA-Z]/.test(ch)) {
      significantBefore++;
    }
  }

  if (significantBefore === 0) {
    return 0;
  }

  let count = 0;
  for (let i = 0; i < masked.length; i++) {
    if (TOKEN_CHARS.has(pattern[i] ?? '')) {
      count++;
      if (count === significantBefore) {
        return i + 1;
      }
    }
  }

  return masked.length;
}

/**
 * Dynamically masks a native `<input>` as the user types.
 * Pair with `[ply-input]` for styling. Form controls receive the **masked**
 * display value (use {@link unmaskInputValue} when you need raw characters).
 *
 * Pattern tokens: `0` digit, `A` letter, `S` alphanumeric; all other chars are literals.
 *
 * @example
 * <input ply-input plyMask="(000) 000-0000" [(ngModel)]="phone" />
 *
 * @example
 * <input ply-input plyMask="00/00/0000" placeholder="MM/DD/YYYY" />
 *
 * @example
 * <input ply-input plyMask="AAAA-0000" />
 */
@Directive({
  selector: 'input[plyMask]',
  host: {
    '(blur)': 'onBlur()',
  },
})
export class BaseMaskDirective implements AfterViewInit, OnDestroy {
  private readonly ssrDocument = inject(DOCUMENT);
  private readonly el = inject(ElementRef<HTMLInputElement>);

  /**
   * Mask pattern applied while typing.
   *
   * Tokens: `0` = digit, `A` = letter, `S` = alphanumeric. Other characters are literals.
   *
   * @example
   * <input ply-input plyMask="(000) 000-0000" />
   */
  readonly plyMask = input.required<string>();

  private readonly onInputCapture = (): void => this.applyFromElement(true);

  constructor() {
    effect(() => {
      this.plyMask();
      untracked(() => this.applyFromElement(false));
    });
  }

  ngAfterViewInit(): void {
    this.el.nativeElement.addEventListener('input', this.onInputCapture, true);
    this.applyFromElement(false);
  }

  ngOnDestroy(): void {
    this.el.nativeElement.removeEventListener('input', this.onInputCapture, true);
  }

  /** Remask on blur so programmatic / pasted values stay consistent. */
  onBlur(): void {
    this.applyFromElement(false);
  }

  /**
   * Current unmasked characters for the bound pattern.
   *
   * @example
   * const digits = this.maskDir.unmaskedValue();
   */
  unmaskedValue(): string {
    return unmaskInputValue(this.el.nativeElement.value, this.plyMask());
  }

  private applyFromElement(preserveCaret: boolean): void {
    const input = this.el.nativeElement;
    const pattern = this.plyMask();
    if (!pattern) {
      return;
    }

    const before = input.value;
    const caret = input.selectionStart ?? before.length;
    const masked = applyInputMask(before, pattern);

    if (masked === before) {
      return;
    }

    input.value = masked;

    if (preserveCaret && this.ssrDocument.activeElement === input) {
      const nextCaret = mapCaretToMasked(before, caret, masked, pattern);
      input.setSelectionRange(nextCaret, nextCaret);
    }
  }
}
