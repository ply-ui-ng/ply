import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';
import { cn } from '../../tw-merge/tw-merge';

/**
 * An error message element for use inside a `ply-input-group`.
 *
 * @example
 * <ply-error>This field is required</ply-error>
 */
@Component({
  selector: 'ply-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error.component.html',
  host: { '[class]': 'hostCls()' }
})
export class ErrorComponent {
  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() =>
    cn('block text-xs text-red-500 mt-1', this.extraClass())
  );
}
