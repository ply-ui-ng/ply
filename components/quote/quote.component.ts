import { Component, input, computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { AvatarComponent } from '../avatar/avatar.component';
import { IconComponent } from '../icon/icon.component';
import { QuoteVariant } from "../types";
import { cn } from '../tw-merge/tw-merge';

/**
 * A stylized blockquote component for displaying testimonials, reviews, or pull quotes.
 * 
 * @example
 * <ply-quote variant="avatar-left" authorName="John Doe" authorRole="CEO" avatarUrl="user.jpg">
 *   This is an amazing product!
 * </ply-quote>
 */
@Component({
  selector: 'ply-quote',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, IconComponent],
  templateUrl: './quote.component.html'
})
export class QuoteComponent {
  /** The structural and visual layout variant of the quote. */
  readonly variant = input<QuoteVariant>('default');
  
  /** The name of the person being quoted. */
  readonly authorName = input<string>();
  
  /** The subtitle or role of the author (e.g. "CEO, Company"). */
  readonly authorRole = input<string>();
  
  /** The URL to the author's avatar image. Primarily used in 'avatar-left' variant. */
  readonly avatarUrl = input<string>();
  
  /** The semantic color name for the quote icon. Defaults to 'primary'. */
  readonly iconColor = input<'primary' | 'success' | 'danger' | 'warning' | 'accent' | 'default' | string>('primary');

  readonly containerClass = computed(() => cn('relative',
    (this.variant() === 'default' || this.variant() === 'border-left') && 'border-s-4 border-slate-300 dark:border-slate-600 ps-4 py-1',
    this.variant() === 'avatar-left' && 'border-s-2 border-slate-200 dark:border-slate-700 ps-4',
    // `isolate` keeps the -z-10 background glyph inside this quote instead of
    // letting it sink behind whatever surface the quote happens to sit on.
    this.variant() === 'icon-top' && 'isolate pt-8 px-4'
  ));

  readonly contentClass = computed(() => cn('leading-relaxed',
    (this.variant() === 'default' || this.variant() === 'border-left') && 'text-slate-600 dark:text-slate-400 italic text-base px-4',
    this.variant() === 'icon-top' && 'text-xl font-bold text-slate-900 dark:text-white mb-4'
  ));

  readonly authorClass = computed(() => cn('text-sm text-start',
    (this.variant() === 'default' || this.variant() === 'border-left') && 'mt-2 px-4'
  ));
}
