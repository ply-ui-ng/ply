import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';
import { cn } from '../../tw-merge/tw-merge';

/**
 * A helper/info text element for use inside a `ply-input-group`.
 *
 * @example
 * <ply-info-text>We'll never share your email</ply-info-text>
 */
@Component({
  selector: 'ply-info-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './info-text.component.html',
  host: { '[class]': 'hostCls()' }
})
export class InfoTextComponent {
  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() =>
    cn('block text-xs text-slate-500 dark:text-slate-400 mt-1', this.extraClass())
  );
}
