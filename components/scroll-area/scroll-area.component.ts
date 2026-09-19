import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { cn } from '../tw-merge/tw-merge';

/**
 * Overflow container with a thin, theme-aware scrollbar. Give it an explicit
 * height (for example `class="h-64"`) so the inner content can scroll.
 *
 * @example
 * <ply-scroll-area class="h-64">
 *   <p>Long content…</p>
 * </ply-scroll-area>
 */
@Component({
  selector: 'ply-scroll-area',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './scroll-area.component.html',
  host: { '[class]': 'hostCls()' },
})
export class ScrollAreaComponent {
  /**
   * Extra host classes merged via `cn()`. Include a height so overflow can scroll.
   * @example
   * <ply-scroll-area class="h-72 max-w-sm"></ply-scroll-area>
   */
  readonly extraClass = input('', { alias: 'class' });

  protected readonly hostCls = computed(() =>
    cn(
      'block min-h-0 overflow-auto [scrollbar-width:thin] [scrollbar-color:rgb(148_163_184)_transparent] dark:[scrollbar-color:rgb(71_85_105)_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600',
      this.extraClass(),
    ),
  );
}
