import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';
import { cn } from '../../tw-merge/tw-merge';

/**
 * Sticky TOC sidebar for `ply-scroll-nav`. Sticks to the top of the parent
 * scrollport; it does not scroll independently.
 *
 * @example
 * <ply-scroll-nav-sidebar>
 *   <a ply-list-item>Section 1</a>
 * </ply-scroll-nav-sidebar>
 */
@Component({
  selector: 'ply-scroll-nav-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scroll-nav-sidebar.component.html',
  host: { '[class]': 'hostCls()' }
})
export class ScrollNavSidebarComponent {
  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() =>
    cn(
      'sticky top-0 hidden w-[280px] min-w-[280px] max-w-[280px] shrink-0 self-start p-4 lg:block',
      this.extraClass(),
    ),
  );
}
