import { Component, computed, input ,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';

import { SkeletonVariant } from '../types';
import { cn } from '../tw-merge/tw-merge';

@Component({
  selector: 'ply-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './skeleton.component.html',
  host: { '[class]': 'hostCls()' } })
export class SkeletonComponent {
  readonly extraClass = input('', { alias: 'class' });
  readonly variant = input<SkeletonVariant>('text');
  readonly count   = input(1);
  readonly width   = input<string | undefined>(undefined);
  readonly height  = input<string | undefined>(undefined);
  readonly animated = input(true, { transform: booleanAttribute });

  protected readonly hostCls = computed(() => cn('block', this.extraClass()));

  readonly items = computed(() => {
    return Array.from({ length: this.count() }, (_, i) => i);
  });

  readonly containerClasses = computed(() => {
    const variantClasses: Record<SkeletonVariant, string> = {
      text: 'h-3 rounded w-full',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
      card: 'rounded-xl h-12 w-full',
      'table-row': 'h-8 rounded w-full' };
    return cn(
      'bg-slate-200 dark:bg-slate-700',
      this.animated() && 'animate-pulse',
      variantClasses[this.variant()]
    );
  });

  readonly customStyle = computed(() => {
    const style: Record<string, string> = {};
    if (this.width())  style['width']  = this.width()!;
    if (this.height()) style['height'] = this.height()!;
    if (this.variant() === 'circular') {
      if (!this.width())  style['width']  = '40px';
      if (!this.height()) style['height'] = style['width'] || '40px';
    }
    return style;
  });
}
