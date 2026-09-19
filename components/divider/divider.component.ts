import { Component, computed, input ,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';

import { cn } from '../tw-merge/tw-merge';

/**
 * A layout component used to separate content visually.
 *
 * @example
 * <ply-divider></ply-divider>
 * <ply-divider [vertical]="true"></ply-divider>
 */
@Component({
  selector: 'ply-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './divider.component.html',
  host: { '[class]': 'hostCls()' } })
export class DividerComponent {
  readonly extraClass = input('', { alias: 'class' });
  /** If true, renders the divider vertically. */
  readonly vertical = input(false, { transform: booleanAttribute });

  protected readonly hostCls = computed(() => cn('block', this.extraClass()));
}
