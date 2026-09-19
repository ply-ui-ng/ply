import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { cn } from '../tw-merge/tw-merge';

/**
 * Box that preserves a width-to-height ratio. Project media or any block inside.
 *
 * @example
 * <ply-aspect-ratio ratio="16/9">
 *   <img src="hero.jpg" alt="" class="h-full w-full object-cover" />
 * </ply-aspect-ratio>
 */
@Component({
  selector: 'ply-aspect-ratio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './aspect-ratio.component.html',
  host: {
    '[class]': 'hostCls()',
    '[style.aspect-ratio]': 'cssRatio()',
  },
})
export class AspectRatioComponent {
  /**
   * Extra host classes merged via `cn()`.
   * @example
   * <ply-aspect-ratio class="w-full rounded-lg" ratio="1/1"></ply-aspect-ratio>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * CSS `aspect-ratio` value (`16/9`, `1`, `4/3`, …).
   * @example
   * <ply-aspect-ratio ratio="4/3"></ply-aspect-ratio>
   */
  readonly ratio = input('16/9');

  protected readonly hostCls = computed(() =>
    cn('relative block w-full overflow-hidden', this.extraClass()),
  );

  protected readonly cssRatio = computed(() => {
    const raw = this.ratio().trim();
    return raw || '16 / 9';
  });
}
