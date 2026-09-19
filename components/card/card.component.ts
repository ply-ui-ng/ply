import { Component, computed, input ,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';
import { cn } from '../tw-merge/tw-merge';

/**
 * A flexible card container component used for grouping related content.
 *
 * @example
 * <ply-card [horizontal]="true">
 *   <ply-card-body>Content here...</ply-card-body>
 * </ply-card>
 */
@Component({
  selector: 'ply-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './card.component.html',
  host: { '[class]': 'hostCls()' } })
export class CardComponent {
  readonly extraClass = input('', { alias: 'class' });
  /** If true, the card lays out its children horizontally instead of vertically. */
  readonly horizontal = input(false, { transform: booleanAttribute });

  protected readonly hostCls = computed(() =>
    cn(
      'block bg-white dark:bg-slate-800 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 not-prose',
      this.extraClass()
    )
  );
}
