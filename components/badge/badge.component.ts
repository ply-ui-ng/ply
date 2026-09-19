import { CommonModule } from '@angular/common';
import { Component, input, computed ,
  ChangeDetectionStrategy
} from '@angular/core';
import { BaseBadgeAddon } from './ply-badge-addon.directive';
import { BadgeColor, BadgeSize, BadgeShape } from "../types";
import { cn } from '../tw-merge/tw-merge';

/**
 * A configurable badge component to display tiny statuses, counts, or tags.
 * 
 * @example
 * <ply-badge color="danger" size="sm" shape="rectangular">New</ply-badge>
 */
@Component({
  selector: 'ply-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, BaseBadgeAddon],
  templateUrl: './badge.component.html'
})
export class BadgeComponent {
  /** The visual color mapping. Defaults to 'primary'. `null` renders the neutral default. */
  readonly color = input<BadgeColor | null>('primary');
  
  /** The size of the badge. Defaults to 'md'. */
  readonly size = input<BadgeSize>('md');
  
  /** The shape (roundness) of the badge. Defaults to 'circle' (pill). */
  readonly shape = input<BadgeShape>('circle');

  readonly badgeClasses = computed(() => {
    const classes = [
      'h-6', 'flex', 'gap-1', 'border', 'border-transparent',
      'justify-center', 'items-center', 'px-3', 'text-xs!',
      'whitespace-nowrap', 'text-white', 'bg-slate-400'
    ];

    // Shape
    classes.push(this.shape() === 'rectangular' ? 'rounded-md' : 'rounded-full');

    // Color
    // Solid variants use 600/700 shades: white text on the 500 scale fails WCAG AA.
    const colorMap: Record<BadgeColor, string> = {
      'primary': 'bg-blue-600!',
      'danger': 'bg-red-600!',
      'success': 'bg-green-700!',
      'accent': 'bg-purple-600!',
      'warning': 'bg-orange-700!',
      'default': 'bg-slate-100! border-slate-300! text-slate-700!',
      'transparent': 'bg-transparent! border-slate-300! text-slate-700!',
      'slate-light': 'bg-slate-200! border-slate-500! text-slate-800!',
      'primary-light': 'bg-blue-100! border-blue-400! text-blue-800!',
      'danger-light': 'bg-red-100! border-red-400! text-red-800!',
      'success-light': 'bg-green-100! border-green-400! text-green-800!',
      'accent-light': 'bg-purple-100! border-purple-400! text-purple-800!',
      'warning-light': 'bg-orange-100! border-orange-400! text-orange-800!'
};
    const color = this.color();
    if (color) {
      const colorClass = colorMap[color];
      if (colorClass) {
        classes.push(colorClass);
      }
    }

    // Size
    const sizeMap: Record<BadgeSize, string> = {
      'sm': 'h-5! text-xs! px-2!',
      'md': 'h-6! text-sm!',
      'default': 'h-6! text-sm!',
      'lg': 'h-7! text-base! px-4!',
      'xl': 'h-8! text-xl! px-4!'
};
    if (sizeMap[this.size()]) {
      classes.push(sizeMap[this.size()]);
    }

    return cn(classes);
  });
}
