import { Directive, TemplateRef, inject } from '@angular/core';

/** Context passed to a {@link CustomSelectOptionDirective} template. */
export interface CustomSelectOptionContext {
  $implicit: unknown;
  option: unknown;
  label: unknown;
  selected: boolean;
  active: boolean;
  index: number;
}

/**
 * Marks an `ng-template` as the option renderer for {@link CustomSelectComponent}.
 * When omitted, the listbox shows `displayKey` (or the option itself).
 *
 * @example
 * <ply-custom-select [options]="cars" displayKey="label" valueKey="value">
 *   <ng-template plySelectOption let-option let-label="label">
 *     <span>{{ label }}</span>
 *   </ng-template>
 * </ply-custom-select>
 */
@Directive({
  selector: '[plySelectOption]',
  standalone: true,
})
export class CustomSelectOptionDirective {
  /** Option template invoked for each listbox row. */
  readonly template = inject(TemplateRef<CustomSelectOptionContext>);

  static ngTemplateContextGuard(
    _dir: CustomSelectOptionDirective,
    _ctx: unknown,
  ): _ctx is CustomSelectOptionContext {
    return true;
  }
}
