import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';
import { cn } from '../../../tw-merge/tw-merge';

/**
 * The body content of an accordion item.
 *
 * @example
 * <ply-accordion-item-body>
 *   Content goes here
 * </ply-accordion-item-body>
 */
@Component({
  selector: 'ply-accordion-item-body',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accordion-item-body.component.html',
  host: { '[class]': 'hostCls()' }
})
export class AccordionItemBodyComponent {
  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() =>
    cn('!text-slate-700 dark:!text-slate-300 font-thin block p-4', this.extraClass())
  );
}
