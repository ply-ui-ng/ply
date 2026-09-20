import { Component, ChangeDetectionStrategy, computed, input, model } from '@angular/core';
import { cn } from '../tw-merge/tw-merge';

let collapsibleId = 0;

/**
 * Standalone disclosure. Use this for one expand/collapse region. For exclusive
 * stacked sections, use `ply-accordion` instead.
 *
 * @example
 * <ply-collapsible>
 *   <button ply-collapsible-trigger>Show details</button>
 *   <ply-collapsible-content>Hidden until opened.</ply-collapsible-content>
 * </ply-collapsible>
 */
@Component({
  selector: 'ply-collapsible',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: { '[class]': 'hostCls()' },
})
export class CollapsibleComponent {
  readonly extraClass = input('', { alias: 'class' });
  /** Two-way open state. */
  readonly open = model(false);
  readonly contentId = `ply-collapsible-${collapsibleId++}`;

  protected readonly hostCls = computed(() => cn('block', this.extraClass()));

  toggle(): void {
    this.open.update((v) => !v);
  }
}
