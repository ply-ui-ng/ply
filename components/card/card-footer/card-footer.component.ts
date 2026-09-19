import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';
import { cn } from '../../tw-merge/tw-merge';

/**
 * The footer section of a ply-card. Usually contains action buttons (Save, Cancel, etc).
 *
 * @example
 * <ply-card-footer>
 *   <button ply-button color="primary">Submit</button>
 * </ply-card-footer>
 */
@Component({
  selector: 'ply-card-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-footer.component.html',
  host: { '[class]': 'hostCls()' }
})
export class CardFooterComponent {
  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() =>
    cn('flex border-t border-slate-300 dark:border-slate-700 p-4 dark:text-slate-300', this.extraClass())
  );
}
