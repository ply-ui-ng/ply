import { Component, inject, input, computed ,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';
import { cn } from '../../tw-merge/tw-merge';
import { RadioGroupComponent, RADIO_GROUP } from '../radio-group.component';
import { RadioColor } from "../../types";

/**
 * An individual radio option inside a `ply-radio-group`.
 *
 * @example
 * <ply-radio-button value="option-1" label="Option 1"></ply-radio-button>
 */
@Component({
  selector: 'ply-radio-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './radio-button.component.html'
})
export class RadioButtonComponent {
  radioGroup = inject<RadioGroupComponent>(RADIO_GROUP, { optional: true });

  /** The native `name` attribute for the radio input. */
  readonly name = input<string>();
  
  /** The value represented by this radio button. Emitted to the parent group when selected. */
  readonly value = input<unknown>(undefined);
  
  /** Semantic color variant. Defaults to 'primary'. */
  readonly color = input<RadioColor>('primary');
  
  /** Disables this specific radio button. */
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly isChecked = computed(() => {
    return this.radioGroup ? this.radioGroup.value() === this.value() : false;
  });

  readonly isDisabled = computed(() => {
    return this.disabled() || (this.radioGroup ? this.radioGroup.isDisabled() : false);
  });

  /** Resolves a shared group name so native arrow-key navigation works. */
  readonly effectiveName = computed(() => {
    if (this.name()) return this.name()!;
    return this.radioGroup?.groupName ?? '';
  });

  readonly radioClasses = computed(() => {
    return cn(
      'w-4 h-4 appearance-none bg-slate-50 dark:bg-slate-600 border mt-0.5 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-900 disabled:opacity-50 disabled:hover:border-slate-300 dark:disabled:hover:border-slate-700 mr-2 rounded-full cursor-pointer disabled:hover:cursor-default checked:hover:cursor-default transform translate-y-0.5 peer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
      this.color() === 'primary' && 'checked:bg-blue-500! checked:border-blue-500! checked:hover:border-blue-600!',
      this.color() === 'danger' && 'checked:bg-red-500! checked:border-red-500! checked:hover:border-red-600!',
      this.color() === 'success' && 'checked:bg-green-500! checked:border-green-500! checked:hover:border-green-600!',
      this.color() === 'accent' && 'checked:bg-purple-500! checked:border-purple-500! checked:hover:border-purple-600!',
      this.color() === 'warning' && 'checked:bg-orange-400! checked:border-orange-400! checked:hover:border-orange-500!'
    );
  });

  onInputInteraction(event: Event) {
    event.stopPropagation();
    if (this.radioGroup && !this.isDisabled()) {
      this.radioGroup.select(this.value());
    }
  }
}
