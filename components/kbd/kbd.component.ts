import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { cn } from '../tw-merge/tw-merge';

/**
 * Inline keyboard glyph for shortcuts in copy, menus, and docs.
 *
 * @example
 * Press <ply-kbd>⌘</ply-kbd> <ply-kbd>K</ply-kbd> to open the command palette.
 */
@Component({
  selector: 'ply-kbd',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './kbd.component.html',
  host: { class: 'contents' },
})
export class KbdComponent {
  /**
   * Extra host classes merged via `cn()`.
   * @example
   * <ply-kbd class="text-xs">Esc</ply-kbd>
   */
  readonly extraClass = input('', { alias: 'class' });

  protected readonly hostCls = computed(() =>
    cn(
      'inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-1.5 font-mono text-xs font-medium text-slate-700 shadow-[0_1px_0_0_rgb(226_232_240)] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:shadow-[0_1px_0_0_rgb(51_65_81)]',
      this.extraClass(),
    ),
  );
}
