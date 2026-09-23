import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { AvatarShape, AvatarSize, AvatarStatus } from '../types';
import { cn } from '../tw-merge/tw-merge';

/**
 * A highly customizable avatar component for displaying user profile images or initials.
 *
 * @example
 * <ply-avatar [avatarUrl]="user.image" size="lg" shape="circle" status="active"></ply-avatar>
 */
@Component({
  selector: 'ply-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  templateUrl: './avatar.component.html',
  host: { '[class]': 'hostCls()' } })
export class AvatarComponent {
  readonly extraClass  = input('', { alias: 'class' });
  readonly avatarUrl   = input<string | undefined>('');
  readonly shape       = input<AvatarShape>('square');
  readonly status      = input<AvatarStatus | undefined>(undefined);
  readonly size        = input<AvatarSize>('md');
  readonly initials    = input('');

  protected readonly hostCls = computed(() => cn('flex shrink-0', this.extraClass()));

  readonly containerClasses = computed(() => {
    const s = this.size();
    return cn({
      'w-6 h-6': s === 'xs',
      'w-8 h-8': s === 'sm',
      'w-10 h-10': s === 'md',
      'w-12 h-12': s === 'lg',
      'w-14 h-14': s === 'xl',
      'w-full h-full': s === 'full'
    });
  });

  readonly innerClasses = computed(() => {
    return cn(this.shape() === 'circle' ? 'rounded-full' : 'rounded-md');
  });

  readonly statusClasses = computed(() => {
    return cn({
      'bg-green-500': this.status() === 'active',
      'bg-slate-400': this.status() === 'inactive',
      'bottom-0 end-0': this.shape() === 'circle',
      '-bottom-px -end-px': this.shape() !== 'circle'
    });
  });
}
