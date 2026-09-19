import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';
import { cn } from '../../tw-merge/tw-merge';

/**
 * Main content column for `ply-scroll-nav`. Grows with its children; scrolling
 * is handled by the parent `ply-scroll-nav` host (not this element).
 *
 * @example
 * <ply-scroll-nav-content>
 *   <section id="section-1">Content</section>
 * </ply-scroll-nav-content>
 */
@Component({
  selector: 'ply-scroll-nav-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scroll-nav-content.component.html',
  host: { '[class]': 'hostCls()' }
})
export class ScrollNavContentComponent {
  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() =>
    cn('min-w-0 w-full flex-1 p-4', this.extraClass())
  );
}
