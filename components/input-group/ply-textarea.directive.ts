import { Directive, computed, input } from '@angular/core';
import { cn } from '../tw-merge/tw-merge';

/**
 * A standard textarea directive that applies consistent Ply styling.
 * Extra `class` values are merged with `cn()`. Focus chrome lives on `ply-input-group`.
 *
 * @example
 * <textarea ply-textarea rows="4" placeholder="Enter your message"></textarea>
 */
@Directive({
  selector: '[ply-textarea]',
  host: {
    '[class]': 'classes()',
  },
})
export class BaseTextareaDirective {
  /** Extra classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  readonly classes = computed(() =>
    cn(
      'w-full min-h-14 block px-1 py-0.5 text-sm text-slate-700 dark:text-slate-300 bg-transparent border-0 rounded-[var(--ply-radius)] transition-colors duration-200',
      'outline-none focus:ring-0 focus:outline-none',
      'disabled:cursor-not-allowed disabled:text-slate-400 read-only:pointer-events-none read-only:cursor-not-allowed read-only:bg-slate-50 dark:read-only:bg-slate-700',
      this.extraClass(),
    ),
  );
}
