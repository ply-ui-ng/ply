import { Directive, computed, input } from '@angular/core';
import { cn } from '../tw-merge/tw-merge';

/**
 * A standard input directive that applies consistent Ply styling to native text inputs.
 * Extra `class` values are merged with `cn()`. Supports disabled and readonly states.
 * Focus chrome lives on `ply-input-group` (`FOCUS_RING_WITHIN`) so addons stay inside the ring.
 *
 * @example
 * <input type="text" ply-input placeholder="Enter your name" />
 */
@Directive({
  selector: '[ply-input]',
  host: {
    '[class]': 'classes()',
  },
})
export class BaseInputDirective {
  /** Extra classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  readonly classes = computed(() =>
    cn(
      'w-full h-9 px-4 text-sm text-slate-700 dark:text-slate-200 bg-transparent rounded-[var(--ply-radius)] transition-all duration-200',
      'outline-none focus:ring-0 focus:outline-none',
      'disabled:cursor-not-allowed disabled:text-slate-400 read-only:pointer-events-none read-only:cursor-not-allowed read-only:bg-slate-50 dark:read-only:bg-slate-700',
      this.extraClass(),
    ),
  );
}
