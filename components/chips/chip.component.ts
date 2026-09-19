import { Component, computed, input, output ,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { ChipColor, ChipSize } from '../types';
import { cn } from '../tw-merge/tw-merge';

@Component({
  selector: 'ply-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './chip.component.html',
  host: { '[class]': 'hostCls()' } })
export class ChipComponent {
  readonly extraClass = input('', { alias: 'class' });
  readonly color      = input<ChipColor>('');
  readonly size       = input<ChipSize>('md');
  readonly removable = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly icon       = input<string | undefined>(undefined);
  readonly active = input(false, { transform: booleanAttribute });
  readonly removeLabel = input('Remove');

  readonly removed = output<void>();
  readonly clicked = output<void>();

  protected readonly hostCls = computed(() => cn('inline-block', this.extraClass()));

  readonly chipClasses = computed(() => {
    const base = 'inline-flex items-center gap-1 font-medium transition-colors duration-200 cursor-pointer select-none';
    const sizeMap: Record<ChipSize, string> = {
      sm: 'text-xs px-2 py-0.5 rounded-full',
      md: 'text-sm px-3 py-1 rounded-full',
      default: 'text-sm px-3 py-1 rounded-full',
      lg: 'text-base px-4 py-1.5 rounded-full' };
    const colorMap: Record<ChipColor, string> = {
      '':      'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700',
      primary: 'bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50',
      success: 'bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/50',
      danger:  'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/50',
      warning: 'bg-orange-50 text-orange-700 border border-orange-100 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800 dark:hover:bg-orange-900/50',
      accent:  'bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/50' };
    const activeMap: Record<ChipColor, string> = {
      '':      'bg-slate-700 text-white border-slate-700 dark:bg-slate-300 dark:text-slate-900 dark:border-slate-300',
      primary: 'bg-blue-600 text-white border-blue-600',
      success: 'bg-green-600 text-white border-green-600',
      danger:  'bg-red-600 text-white border-red-600',
      warning: 'bg-orange-600 text-white border-orange-600',
      accent:  'bg-purple-600 text-white border-purple-600' };
    return cn(
      base,
      sizeMap[this.size()],
      this.active() ? activeMap[this.color()] : colorMap[this.color()],
      this.disabled() && 'opacity-50 cursor-not-allowed pointer-events-none'
    );
  });

  readonly iconClasses = computed(() => {
    const s = this.size();
    return s === 'sm' ? 'w-3 h-3' : s === 'lg' ? 'w-[18px] h-[18px]' : 'w-3.5 h-3.5';
  });

  readonly closeIconClasses = computed(() => {
    const s = this.size();
    return s === 'sm' ? 'w-3 h-3 opacity-70 hover:opacity-100' : s === 'lg' ? 'w-4 h-4 opacity-70 hover:opacity-100' : 'w-3.5 h-3.5 opacity-70 hover:opacity-100';
  });

  handleRemove(e: MouseEvent) { e.stopPropagation(); if (!this.disabled()) this.removed.emit(); }
  handleClick() { if (!this.disabled()) this.clicked.emit(); }
}
