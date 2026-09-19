import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';
import { cn } from '../../tw-merge/tw-merge';

/**
 * The main content container of a ply-card. Provides correct padding and spacing.
 *
 * @example
 * <ply-card-body>
 *   <p>Card content goes here.</p>
 * </ply-card-body>
 */
@Component({
  selector: 'ply-card-body',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-body.component.html',
  host: { '[class]': 'hostCls()' }
})
export class CardBodyComponent {
  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() =>
    cn('block p-4 relative overflow-y-auto overflow-x-hidden dark:!text-slate-300', this.extraClass())
  );
}
