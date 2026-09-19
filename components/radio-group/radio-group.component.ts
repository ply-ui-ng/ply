import { Component, InjectionToken, forwardRef, input, model, ChangeDetectionStrategy, booleanAttribute, computed, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const RADIO_GROUP = new InjectionToken<RadioGroupComponent>('RadioGroup');

let radioGroupIdCounter = 0;

/**
 * A container component for a group of `ply-radio-button` elements.
 * Manages the selected state and integrates with Angular Forms (ngModel, formControlName).
 *
 * @example
 * <ply-radio-group groupLabel="Notification preference" [(ngModel)]="selectedValue">
 *   <ply-radio-button value="1">Option 1</ply-radio-button>
 *   <ply-radio-button value="2">Option 2</ply-radio-button>
 * </ply-radio-group>
 */
@Component({
  selector: 'ply-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './radio-group.component.html',
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-labelledby]': 'groupLabel() ? labelId : (labelledBy() || null)',
    '[attr.aria-disabled]': 'isDisabled() ? true : null',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true,
    },
    { provide: RADIO_GROUP, useExisting: RadioGroupComponent },
  ],
})
export class RadioGroupComponent implements ControlValueAccessor {
  /** The currently selected value within the group. */
  readonly value = model<unknown>(undefined);

  /** Disables all radio buttons within this group when true. */
  /** Whether the control is disabled (consumer-facing input). */

  readonly disabled = input(false, { transform: booleanAttribute });

  /** Disabled state applied by Angular Forms via `setDisabledState`. */

  private readonly formDisabled = signal(false);

  /** Effective disabled state: consumer `disabled` input OR forms-disabled. */

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());


  /** Visible group label; wired to aria-labelledby for screen readers. */
  readonly groupLabel = input('');

  /** Accessible name when no visible groupLabel is provided. */
  readonly ariaLabel = input('');

  /** ID of an external element that labels this group. */
  readonly labelledBy = input('');

  /** Shared native name assigned to child radio inputs for arrow-key navigation. */
  readonly groupName = `ply-radio-group-${radioGroupIdCounter}`;

  /** Element id for the optional visible group label. */
  readonly labelId = `ply-radio-group-label-${radioGroupIdCounter++}`;

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: unknown): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  select(value: unknown): void {
    if (!this.isDisabled()) {
      this.value.set(value);
      this.onChange(value);
      this.onTouched();
    }
  }
}
