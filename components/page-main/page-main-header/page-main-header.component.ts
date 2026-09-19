import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';

import { cn } from '../../tw-merge/tw-merge';

/**
 * A header section for `ply-page-main`.
 *
 * @example
 * <ply-page-main-header>
 *   <h1>Page Title</h1>
 * </ply-page-main-header>
 */
@Component({
  selector: 'ply-page-main-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './page-main-header.component.html',
  host: { '[class]': 'hostCls()' } })
export class PageMainHeaderComponent {
  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() =>
    cn('block w-full border-b border-slate-200 dark:border-slate-800', this.extraClass())
  );
}
