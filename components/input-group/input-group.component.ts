import {
  Component,
  ElementRef,
  ChangeDetectorRef,
  computed,
  contentChild,
  effect,
  inject,
  input,
  ChangeDetectionStrategy,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgControl } from '@angular/forms';
import { cn, FOCUS_RING_WITHIN } from '../tw-merge/tw-merge';
import { LabelComponent } from './label/label.component';
import { BaseInputDirective } from './ply-input.directive';
import { BaseTextareaDirective } from './ply-textarea.directive';

let inputGroupIdCounter = 0;

/**
 * A structural container wrapping form controls.
 *
 * Extra `class` values are merged with `cn()`. Validation messages
 * (`ply-error`) show after the field is touched for `formControlName` /
 * `ngModel`. Signal-forms `[formField]` error chrome is on `main` (Angular 21+).
 * Focus ring is on this wrapper (`focus-within`) so start/end addons stay
 * inside the halo.
 *
 * @example
 * <ply-input-group>
 *   <ply-label>Username</ply-label>
 *   <input ply-input type="text" formControlName="username">
 *   <ply-error>Required</ply-error>
 * </ply-input-group>
 */
@Component({
  selector: 'ply-input-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './input-group.component.html',
  host: {
    '[class]': 'hostCls()',
    '(focusout)': 'onFocusOut()',
  },
})
export class InputGroupComponent {
  /** Stable per-group id linking the label's `for` to the projected input. */
  readonly inputId = `ply-input-${inputGroupIdCounter++}`;
  /** Id used for `aria-describedby` when an error is visible. */
  readonly errorId = `${this.inputId}-error`;

  readonly extraClass = input('', { alias: 'class' });
  /**
   * Force the error state (red border + projected `ply-error`).
   * Composite CVA hosts such as `ply-password-input` bind this when the
   * form control lives on the wrapper, not the projected native input.
   */
  readonly invalid = input(false, { transform: booleanAttribute });

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly label = contentChild(LabelComponent);
  private readonly inputEl = contentChild(BaseInputDirective, { read: ElementRef });
  private readonly textareaEl = contentChild(BaseTextareaDirective, { read: ElementRef });
  readonly control = contentChild(NgControl, { descendants: true });

  constructor() {
    effect(() => this.syncControlDom());
  }

  protected readonly hostCls = computed(() => cn('block w-full', this.extraClass()));

  showErrors(): boolean {
    if (this.invalid()) return true;
    const ctrl = this.control();
    if (!ctrl) return false;
    return !!(ctrl.touched && ctrl.errors);
  }

  getWrapperClasses(): string {
    return cn(
      'flex items-center w-full min-h-9 border border-solid border-[var(--ply-border)] rounded-[var(--ply-radius)] relative bg-[var(--ply-background)] shadow-sm focus-within:border-[var(--ply-ring)]!',
      FOCUS_RING_WITHIN,
      { 'border-red-500!': this.showErrors() },
    );
  }

  protected onFocusOut(): void {
    this.syncControlDom();
    this.cdr.markForCheck();
  }

  private syncControlDom(): void {
    const el = (this.inputEl() ?? this.textareaEl())?.nativeElement as HTMLElement | undefined;
    if (!el) return;
    if (!el.id) el.id = this.inputId;
    const label = this.label();
    if (label) label.associatedId.set(el.id);

    const invalid = this.showErrors();
    el.setAttribute('aria-invalid', invalid ? 'true' : 'false');
    if (invalid) {
      el.setAttribute('aria-describedby', this.errorId);
    } else {
      el.removeAttribute('aria-describedby');
    }
  }
}
