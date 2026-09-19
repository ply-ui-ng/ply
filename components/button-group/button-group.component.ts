import {
  Component,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  output,
  ChangeDetectionStrategy
} from '@angular/core';
import { GroupButtonComponent } from './group-button/group-button.component';
import { ToggleButtonService, ToggleGroupButton } from './toggle-button.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { cn } from '../tw-merge/tw-merge';
import { GroupButtonSize } from '../types';
import { BUTTON_GROUP } from './button-group.token';

export { BUTTON_GROUP } from './button-group.token';
export type { ButtonGroupParent } from './button-group.token';

/**
 * A container for grouping multiple toggle buttons.
 *
 * @example
 * <ply-button-group size="sm" [(ngModel)]="viewMode">
 *   <ply-group-button-item value="list" icon="list"></ply-group-button-item>
 * </ply-button-group>
 */
@Component({
  selector: 'ply-button-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './button-group.component.html',
  host: { '[class]': 'hostCls()' },
  providers: [
    ToggleButtonService,
    { provide: BUTTON_GROUP, useExisting: ButtonGroupComponent },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ButtonGroupComponent), multi: true }]
})
export class ButtonGroupComponent implements ControlValueAccessor {
  readonly extraClass = input('', { alias: 'class' });
  /**
   * Shared size for all items in the group. Matches button / icon-button heights
   * (`sm` = 28px, `default` = 36px, etc.).
   * @example
   * <ply-button-group size="sm">...</ply-button-group>
   */
  readonly size = input<GroupButtonSize>('default');
  readonly valueChange = output<unknown>();

  readonly buttons = contentChildren(GroupButtonComponent);

  protected readonly hostCls = computed(() =>
    cn(
      'flex overflow-hidden rounded-md w-fit border border-slate-300 dark:border-slate-700',
      this.extraClass()
    )
  );

  private onChange: (v: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private currentValue: unknown;
  private toggleButtonService = inject(ToggleButtonService);

  constructor() {
    this.toggleButtonService.selectButton$
      .pipe(takeUntilDestroyed())
      .subscribe((btn: ToggleGroupButton) => this.onButtonClicked(btn));

    effect(() => {
      const btns = this.buttons();
      if (this.currentValue !== undefined) this.selectByValue(this.currentValue, btns);
    });
  }

  private onButtonClicked(btn: ToggleGroupButton) {
    this.buttons().forEach(b => b.active.set(false));
    btn.active.set(true);
    this.currentValue = btn.value();
    this.valueChange.emit(this.currentValue);
    this.onChange(this.currentValue);
    this.onTouched();
  }

  private selectByValue(value: unknown, btns = this.buttons()) {
    btns.forEach(b => b.active.set(b.value() === value));
  }

  writeValue(v: unknown)                   { this.currentValue = v; this.selectByValue(v); }
  registerOnChange(fn: (v: unknown) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void)          { this.onTouched = fn; }
  setDisabledState?(_: boolean): void { return; }
}
