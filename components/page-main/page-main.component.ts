import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';

import { cn } from '../tw-merge/tw-merge';

/**
 * The primary layout wrapper for a main page view.
 *
 * @example
 * <ply-page-main>
 *   <ply-page-main-header>Title</ply-page-main-header>
 *   <ply-page-main-body>Content</ply-page-main-body>
 *   <ply-page-main-footer>Footer</ply-page-main-footer>
 * </ply-page-main>
 */
@Component({
  selector: 'ply-page-main',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './page-main.component.html',
  host: { '[class]': 'hostCls()' } })
export class PageMainComponent {
  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() =>
    cn('block w-full h-full flex flex-col overflow-hidden', this.extraClass())
  );
}
