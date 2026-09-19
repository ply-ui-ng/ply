import { Directive, computed, input } from '@angular/core';
import { IconButtonColor, IconButtonSize } from "../types";
import { cn, FOCUS_RING } from '../tw-merge/tw-merge';

/**
 * An icon-only button directive applying Ply theme styles.
 *
 * Extra `class` values are merged with `cn()` so they override defaults
 * (e.g. `class="rounded-full"`). Text color uses `!` so it wins on `<a>`.
 *
 * @example
 * <button ply-icon-button color="primary" size="lg">
 *   <ply-icon name="plus"></ply-icon>
 * </button>
 */
@Directive({
  selector: '[ply-icon-button]',
  host: {
    '[class]': 'classes()'
  }
})
export class IconButtonDirective {
  /** Extra classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  /** The semantic visual color. Defaults to 'default'. */
  readonly color = input<IconButtonColor>('default');
  
  /** The size of the button. Defaults to 'default'. */
  readonly size = input<IconButtonSize>('default');

  readonly classes = computed(() => {
    const baseClasses = `flex items-center justify-center relative rounded-[var(--ply-radius)] tracking-wide transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_ply-icon]:stroke-current [&_ply-icon]:fill-current ${FOCUS_RING}`;
    
    const colorMap: Record<string, string> = {
      primary: 'text-[var(--ply-primary-foreground)]! bg-[var(--ply-primary)] hover:bg-[var(--ply-primary-hover)] active:bg-[var(--ply-primary-active)] disabled:opacity-50',
      success: 'text-white! bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:bg-green-300',
      danger: 'text-[var(--ply-destructive-foreground)]! bg-[var(--ply-destructive)] hover:bg-[var(--ply-destructive-hover)] active:bg-red-800 disabled:opacity-50',
      warning: 'text-white! bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-orange-300',
      accent: 'text-white! bg-purple-500 hover:bg-purple-600 active:bg-purple-700 disabled:bg-purple-300',
      white: 'text-slate-900! bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50',
      black: 'text-white! bg-slate-900 dark:bg-black hover:bg-slate-800 dark:hover:bg-slate-900 active:bg-slate-700 dark:active:bg-slate-800 disabled:opacity-50',
      default: 'text-[var(--ply-muted-foreground)]! bg-[var(--ply-muted)] hover:bg-slate-300 dark:hover:bg-slate-700 active:bg-slate-400 dark:active:bg-slate-600 disabled:opacity-50',
      secondary: 'text-white! bg-slate-500 hover:bg-slate-600 active:bg-slate-700 disabled:bg-slate-300',
      inverted: 'text-white! bg-black/40 hover:bg-black/60 active:bg-black/70 backdrop-blur-sm disabled:opacity-50',
      transparent: 'text-[var(--ply-muted-foreground)]! bg-transparent hover:bg-slate-200/50 dark:hover:bg-slate-700/50 active:bg-slate-300/50 dark:active:bg-slate-600/50 disabled:opacity-50',
    };

    const sizeMap: Record<IconButtonSize, string> = {
      sm: 'h-7 w-7 min-w-7 max-w-7 [&_ply-icon]:w-3 [&_ply-icon]:h-3',
      md: 'h-8 w-8 min-w-8 max-w-8 [&_ply-icon]:w-4 [&_ply-icon]:h-4',
      default: 'h-9 w-9 min-w-9 max-w-9 [&_ply-icon]:w-5 [&_ply-icon]:h-5',
      lg: 'h-10 w-10 min-w-10 max-w-10 [&_ply-icon]:w-6 [&_ply-icon]:h-6',
      xl: 'h-11 w-11 min-w-11 max-w-11 [&_ply-icon]:w-6 [&_ply-icon]:h-6',
      xxl: 'h-14 w-14 min-w-14 max-w-14 [&_ply-icon]:w-7 [&_ply-icon]:h-7',
    };

    const colorClass = colorMap[this.color()] || colorMap['default'];
    const sizeClass = sizeMap[this.size()] || sizeMap['default'];

    return cn(baseClasses, colorClass, sizeClass, this.extraClass());
  });
}
