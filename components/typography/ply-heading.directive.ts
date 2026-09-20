import { Directive, computed, input } from '@angular/core';
import { cn } from '../tw-merge/tw-merge';

export type TypographyVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'caption'
  | 'overline';

const VARIANT_CLASS: Record<TypographyVariant, string> = {
  display: 'text-4xl font-bold tracking-tight sm:text-5xl',
  title: 'text-3xl font-bold tracking-tight',
  heading: 'text-2xl font-semibold tracking-tight',
  subheading: 'text-lg font-medium',
  body: 'text-base font-normal text-slate-600 dark:text-slate-300',
  caption: 'text-sm text-slate-500 dark:text-slate-400',
  overline: 'text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400',
};

/**
 * Type-scale utility. `plyHeadingText` is the heading step (2xl semibold).
 * Set `plyTypography` to pick a step on the scale.
 *
 * @example
 * <h1 plyTypography="display">Page title</h1>
 * <p plyTypography="body">Supporting copy.</p>
 * <h2 plyHeadingText>Section</h2>
 */
@Directive({
  selector: '[plyHeadingText], [plyTypography]',
  host: { '[class]': 'hostCls()' },
})
export class BaseHeadingDirective {
  readonly extraClass = input('', { alias: 'class' });
  readonly variant = input<TypographyVariant>('heading', { alias: 'plyTypography' });

  protected readonly hostCls = computed(() =>
    cn('text-slate-900 dark:text-white', VARIANT_CLASS[this.variant()], this.extraClass()),
  );
}
