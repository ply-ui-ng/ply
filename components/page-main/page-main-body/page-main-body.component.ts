import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';

import { cn } from '../../tw-merge/tw-merge';

/**
 * A body content section for `ply-page-main`.
 *
 * @example
 * <ply-page-main-body>
 *   <p>Main page content</p>
 * </ply-page-main-body>
 */
@Component({
  selector: 'ply-page-main-body',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './page-main-body.component.html',
  host: { '[class]': 'hostCls()' } })
export class PageMainBodyComponent {
  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() =>
    cn('flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8', this.extraClass())
  );
}
