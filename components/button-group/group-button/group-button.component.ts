import { Component, computed, inject, input , signal,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../icon/icon.component';
import { ToggleButtonService } from '../toggle-button.service';
import { BUTTON_GROUP } from '../button-group.token';
import { cn } from '../../tw-merge/tw-merge';
import { GroupButtonSize } from '../../types';

const SIZE_CLASSES: Record<GroupButtonSize, string> = {
  sm: 'h-7 text-xs px-3',
  md: 'h-9 text-sm px-4',
  default: 'h-9 text-sm px-4',
  lg: 'h-10 text-base px-5',
  xl: 'h-11 text-base px-6',
  xxl: 'h-14 text-lg px-8',
};

const ICON_SIZE_CLASSES: Record<GroupButtonSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  default: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-5 h-5',
  xxl: 'w-6 h-6',
};

/**
 * An individual button item inside a `ply-button-group`.
 *
 * @example
 * <ply-group-button-item value="list" icon="list"></ply-group-button-item>
 */
@Component({
  selector: 'ply-group-button-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  templateUrl: './group-button.component.html',
  host: { '[class]': 'hostCls()' } })
export class GroupButtonComponent {
  private readonly buttonGroup = inject(BUTTON_GROUP, { optional: true });

  readonly extraClass = input('', { alias: 'class' });
  readonly icon       = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly value      = input<unknown>(undefined);
  /**
   * Optional size override. When omitted, inherits from the parent `ply-button-group`.
   * @example
   * <ply-group-button-item value="grid" icon="grid" size="sm"></ply-group-button-item>
   */
  readonly size = input<GroupButtonSize | undefined>(undefined);

  protected readonly hostCls = computed(() =>
    cn('border-r border-slate-300 dark:border-slate-700 last-of-type:border-r-0', this.extraClass())
  );

  /** Resolved size: item override → parent group → default. */
  protected readonly resolvedSize = computed<GroupButtonSize>(() => {
    return this.size() ?? this.buttonGroup?.size() ?? 'default';
  });

  // Mutable active state managed by parent ButtonGroupComponent
  active = signal(false);

  protected readonly buttonClasses = computed(() => cn(
    'flex items-center gap-2 relative text-center justify-center tracking-wide text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-500 dark:active:bg-slate-600 cursor-pointer disabled:pointer-events-none disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-50',
    SIZE_CLASSES[this.resolvedSize()],
    { 'bg-slate-200 dark:bg-slate-700': this.active() }
  ));

  protected readonly iconClasses = computed(() =>
    cn(
      'stroke-slate-800 dark:stroke-slate-100',
      ICON_SIZE_CLASSES[this.resolvedSize()]
    )
  );

  private toggleButtonService = inject(ToggleButtonService);

  toggle() {
    if (!this.disabled()) this.toggleButtonService.setSelectedButton(this);
  }
}
