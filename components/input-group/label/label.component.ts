import { Component, computed, input, signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { cn } from '../../tw-merge/tw-merge';

/**
 * A label element for use inside a `ply-input-group`.
 *
 * @example
 * <ply-label>Email address</ply-label>
 */
@Component({
  selector: 'ply-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './label.component.html',
  host: { '[class]': 'hostCls()' }
})
export class LabelComponent {
  readonly extraClass = input('', { alias: 'class' });

  /** Explicit `for` attribute; `ply-input-group` auto-fills it via {@link associatedId}. */
  readonly forInput = input('', { alias: 'for' });

  /** Set by `ply-input-group` to associate this label with the projected control. */
  readonly associatedId = signal('');

  /** Native `<label for>` — explicit input wins, otherwise the group's generated id. */
  protected readonly effectiveFor = computed(() => this.forInput() || this.associatedId() || null);

  protected readonly hostCls = computed(() =>
    cn('block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1', this.extraClass())
  );
}
