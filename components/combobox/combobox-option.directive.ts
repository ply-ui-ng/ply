import { Directive, TemplateRef, inject } from '@angular/core';
import { ComboboxOption } from '../types';

/** Context passed to a {@link ComboboxOptionDirective} template. */
export interface ComboboxOptionContext {
  $implicit: ComboboxOption;
  option: ComboboxOption;
  selected: boolean;
  active: boolean;
  index: number;
}

/**
 * Marks an `ng-template` as the option renderer for {@link ComboboxComponent}.
 * When omitted, the listbox shows `option.label` and optional `option.description`.
 *
 * @example
 * <ply-combobox [options]="people" [(ngModel)]="id">
 *   <ng-template plyComboboxOption let-option let-selected="selected">
 *     <span>{{ option.label }}</span>
 *   </ng-template>
 * </ply-combobox>
 */
@Directive({
  selector: '[plyComboboxOption]',
  standalone: true,
})
export class ComboboxOptionDirective {
  /** Option template invoked for each filtered listbox row. */
  readonly template = inject(TemplateRef<ComboboxOptionContext>);

  static ngTemplateContextGuard(
    _dir: ComboboxOptionDirective,
    _ctx: unknown,
  ): _ctx is ComboboxOptionContext {
    return true;
  }
}
