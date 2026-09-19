import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { FORM_FIELD } from '@angular/forms/signals';
import { cn } from '../tw-merge/tw-merge';
import { BASE_UI_I18N } from '../i18n/i18n';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { BaseInputDirective } from '../input-group/ply-input.directive';
import { BaseAddonEndDirective } from '../input-group/ply-addon-end.directive';
import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { IconComponent } from '../icon/icon.component';
import { PasswordStrengthComponent } from '../password-strength/password-strength.component';

/**
 * Password field with a show/hide toggle. Integrates with Angular Forms via
 * ControlValueAccessor. Do not wrap this in another `ply-input-group` —
 * the control already includes one. Project `ply-error` as content.
 *
 * @example
 * <ply-password-input label="Password" formControlName="password" [showStrength]="true">
 *   <ply-error>Password is required</ply-error>
 * </ply-password-input>
 */
@Component({
  selector: 'ply-password-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputGroupComponent,
    LabelComponent,
    BaseInputDirective,
    BaseAddonEndDirective,
    IconButtonDirective,
    IconComponent,
    PasswordStrengthComponent,
  ],
  templateUrl: './password-input.component.html',
  host: { '[class]': 'hostCls()' },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PasswordInputComponent), multi: true },
  ],
})
export class PasswordInputComponent implements ControlValueAccessor {
  readonly extraClass = input('', { alias: 'class' });
  readonly label = input('');
  readonly placeholder = input('••••••••');
  readonly autocomplete = input('current-password');
  readonly name = input('');
  readonly showStrength = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly i18n = inject(BASE_UI_I18N);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);
  private readonly formField = inject(FORM_FIELD, { optional: true });
  private ngControl: NgControl | null = null;

  protected readonly visible = signal(false);
  protected readonly value = signal('');
  private readonly formDisabled = signal(false);

  protected readonly hostCls = computed(() => cn('block w-full', this.extraClass()));
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly inputType = computed(() => (this.visible() ? 'text' : 'password'));
  protected readonly toggleLabel = computed(() =>
    this.visible() ? this.i18n.hidePassword : this.i18n.showPassword,
  );

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    afterNextRender(() => {
      this.ngControl = this.injector.get(NgControl, null, { optional: true, self: true });
      this.cdr.markForCheck();
    });
  }

  protected showErrors(): boolean {
    const field = this.formField;
    if (field) {
      const state = field.state();
      return state.invalid() && state.touched();
    }
    const ctrl = this.ngControl;
    if (!ctrl) return false;
    return !!(ctrl.touched && ctrl.invalid);
  }

  protected toggleVisible(): void {
    this.visible.update((v) => !v);
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  protected onBlur(): void {
    this.onTouched();
    this.cdr.markForCheck();
  }

  writeValue(val: string): void {
    this.value.set(val ?? '');
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(d: boolean): void {
    this.formDisabled.set(d);
    this.cdr.markForCheck();
  }
}
