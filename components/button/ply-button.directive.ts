import { Directive, computed, input } from '@angular/core';
import { ButtonColor, ButtonSize } from "../types";
import { cn, FOCUS_RING } from '../tw-merge/tw-merge';

/**
 * A standard button directive applying Ply theme styles.
 *
 * Extra `class` values are merged with `cn()` so they override defaults
 * (e.g. `class="rounded-full"`). Text color uses `!` so it wins on `<a>`
 * (default/visited link blue). Brand color uses `--ply-primary` from
 * `ply-ui.css`.
 *
 * @example
 * <button ply-button color="primary" size="lg">Submit</button>
 */
@Directive({
  selector: '[ply-button]',
  host: {
    '[class]': 'classes()',
    '[style.width]': 'styleWidth()'
  }
})
export class BaseButtonDirective {
  /** Extra classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  /** The semantic visual color. Defaults to 'default'. */
  readonly color = input<ButtonColor>('default');
  
  /** The size of the button. Defaults to 'default'. */
  readonly size = input<ButtonSize>('default');
  
  /** Optional custom width (e.g. '100%'). */
  readonly width = input<string>();

  readonly classes = computed(() => {
    const baseClasses = `flex items-center gap-2 relative rounded-[var(--ply-radius)] text-center justify-center tracking-wide font-medium transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_ply-icon]:stroke-current [&_ply-icon]:fill-current ${FOCUS_RING}`;

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
      dark: 'text-white! bg-slate-900 dark:bg-black hover:bg-slate-800 dark:hover:bg-slate-900 active:bg-slate-700 dark:active:bg-slate-800 disabled:opacity-50',
      slate: 'text-white! bg-slate-500 hover:bg-slate-600 active:bg-slate-700 disabled:bg-slate-300',
      transparent: 'text-[var(--ply-muted-foreground)]! bg-transparent hover:bg-slate-200/50 dark:hover:bg-slate-700/50 active:bg-slate-300/50 dark:active:bg-slate-600/50 disabled:opacity-50',
    };

    const sizeMap: Record<ButtonSize, string> = {
      sm: 'h-7 text-xs px-4 [&_ply-icon]:w-3 [&_ply-icon]:h-3',
      md: 'h-9 text-sm px-6 [&_ply-icon]:w-5 [&_ply-icon]:h-5',
      default: 'h-9 text-sm px-6 [&_ply-icon]:w-5 [&_ply-icon]:h-5',
      lg: 'h-10 text-base px-7 [&_ply-icon]:w-6 [&_ply-icon]:h-6',
      xl: 'h-11 text-base px-8 [&_ply-icon]:w-6 [&_ply-icon]:h-6',
      xxl: 'h-14 text-lg px-10 [&_ply-icon]:w-7 [&_ply-icon]:h-7',
    };

    const colorClass = colorMap[this.color()] || colorMap['default'];
    const sizeClass = sizeMap[this.size()] || sizeMap['default'];

    return cn(baseClasses, colorClass, sizeClass, this.extraClass());
  });

  readonly styleWidth = computed(() => {
    return this.width() || null;
  });
}
