import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';
import { cn } from '../../tw-merge/tw-merge';

/**
 * The header section of a ply-card. Usually contains the title and optional actions.
 *
 * @example
 * <ply-card-header>Card Title</ply-card-header>
 */
@Component({
  selector: 'ply-card-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-header.component.html',
  host: { '[class]': 'hostCls()' }
})
export class CardHeaderComponent {
  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() =>
    cn(
      'flex h-14 font-semibold justify-between items-center border-b border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:bg-slate-800 px-4 not-prose',
      this.extraClass()
    )
  );
}
