import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';

import { cn } from '../tw-merge/tw-merge';
import { AvatarSize } from '../types';

export interface AvatarGroupItem {
  avatarUrl?: string;
  initials?: string;
  name?: string;
}

/**
 * Displays a stack of overlapping avatars with an overflow count badge.
 * Avatars overlap tightly at rest and spread apart on hover.
 *
 * @example
 * <ply-avatar-group [items]="users" [max]="4" size="md"></ply-avatar-group>
 */
@Component({
  selector: 'ply-avatar-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './avatar-group.component.html',
  host: { '[class]': 'hostCls()' } })
export class AvatarGroupComponent {
  readonly extraClass = input('', { alias: 'class' });
  readonly items = input<AvatarGroupItem[]>([]);
  readonly max   = input(4);
  readonly size  = input<AvatarSize>('md');

  protected readonly hostCls = computed(() =>
    cn('flex items-center group', this.extraClass())
  );

  readonly visibleItems = computed(() => {
    return this.items().slice(0, this.max());
  });

  readonly overflowCount = computed(() => {
    return Math.max(0, this.items().length - this.max());
  });

  readonly sizeClasses = computed(() => {
    const map: Record<AvatarSize, string> = {
      xs:   'w-6 h-6 text-xs',
      sm:   'w-8 h-8 text-xs',
      md:   'w-10 h-10 text-sm',
      lg:   'w-12 h-12 text-base',
      xl:   'w-14 h-14 text-lg',
      full: 'w-full h-full text-base' };
    return map[this.size()] ?? map.md;
  });

  readonly borderClasses = computed(() => {
    return 'rounded-full border-2 border-white dark:border-slate-800 -ml-4 first:ml-0 group-hover:-ml-2 transition-[margin] duration-300 ease-in-out';
  });
}
