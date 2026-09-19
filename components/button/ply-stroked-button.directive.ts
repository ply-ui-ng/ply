import { Directive, computed, input } from '@angular/core';
import { StrokedButtonColor, StrokedButtonSize } from "../types";
import { cn, FOCUS_RING } from '../tw-merge/tw-merge';

/**
 * A stroked button directive applying Ply theme styles.
 *
 * Extra `class` values are merged with `cn()` so they override defaults.
 * Text color uses `!` so it wins on `<a>` (default/visited link blue).
 *
 * @example
 * <button ply-stroked-button color="primary" size="lg">Submit</button>
 */
@Directive({
  selector: '[ply-stroked-button]',
  host: {
    '[class]': 'classes()',
    '[style.width]': 'styleWidth()'
  }
})
export class StrokedButtonDirective {
  /** Extra classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  /** The semantic visual color. Defaults to 'default'. */
  readonly color = input<StrokedButtonColor>('default');
  
  /** The size of the button. Defaults to 'default'. */
  readonly size = input<StrokedButtonSize>('default');
  
  /** Optional custom width (e.g. '100%'). */
  readonly width = input<string>();

  readonly classes = computed(() => {
    const baseClasses = `flex items-center gap-2 relative rounded-[var(--ply-radius)] border text-center justify-center tracking-wide transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_ply-icon]:stroke-current [&_ply-icon]:fill-current ${FOCUS_RING}`;
    
    const colorMap: Record<StrokedButtonColor, string> = {
      primary: 'text-[var(--ply-primary)]! border-[var(--ply-primary)] hover:bg-blue-50 hover:text-[var(--ply-primary-hover)]! hover:border-[var(--ply-primary-hover)] active:bg-blue-100',
      success: 'text-green-500! border-green-500 hover:bg-green-50 hover:text-green-600! hover:border-green-600 active:bg-green-100',
      danger: 'text-[var(--ply-destructive)]! border-[var(--ply-destructive)] hover:bg-red-50 hover:text-[var(--ply-destructive-hover)]! hover:border-[var(--ply-destructive-hover)] active:bg-red-100',
      warning: 'text-orange-500! border-orange-500 hover:bg-orange-50 hover:text-orange-600! hover:border-orange-600 active:bg-orange-100',
      accent: 'text-purple-500! border-purple-500 hover:bg-purple-50 hover:text-purple-600! hover:border-purple-600 active:bg-purple-100',
      white: 'text-white! border-white hover:bg-white/10 hover:text-white! hover:border-white active:bg-white/20',
      black: 'text-slate-900! dark:text-white! border-slate-900 dark:border-white hover:bg-slate-900/10 dark:hover:bg-white/10 hover:text-slate-900! dark:hover:text-white! hover:border-slate-900 dark:hover:border-white active:bg-slate-900/20 dark:active:bg-white/20',
      default: 'text-[var(--ply-muted-foreground)]! border-[var(--ply-border)] hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-900',
      secondary: 'text-slate-500! border-slate-500 hover:bg-slate-50 hover:text-slate-600! hover:border-slate-600 active:bg-slate-100',
      dark: 'text-slate-900! dark:text-white! border-slate-900 dark:border-white hover:bg-slate-900/10 dark:hover:bg-white/10 hover:text-slate-900! dark:hover:text-white! hover:border-slate-900 dark:hover:border-white active:bg-slate-900/20 dark:active:bg-white/20',
      slate: 'text-slate-500! border-slate-500 hover:bg-slate-50 hover:text-slate-600! hover:border-slate-600 active:bg-slate-100',
      transparent: 'text-[var(--ply-muted-foreground)]! border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700',
    };

    const sizeMap: Record<StrokedButtonSize, string> = {
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
