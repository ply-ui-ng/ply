import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';

import { cn } from '../../tw-merge/tw-merge';

/**
 * A footer section for `ply-page-main`.
 *
 * @example
 * <ply-page-main-footer>
 *   <p>&copy; 2026 Company</p>
 * </ply-page-main-footer>
 */
@Component({
  selector: 'ply-page-main-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './page-main-footer.component.html',
  host: { '[class]': 'hostCls()' } })
export class PageMainFooterComponent {
  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() =>
    cn('block w-full border-t border-slate-200 dark:border-slate-800', this.extraClass())
  );
}
