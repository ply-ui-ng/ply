import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { ScrollButtonBase } from './scroll-button.base';

/**
 * Floating “scroll to bottom” button that appears when more content remains below.
 *
 * @example
 * <ply-scroll-bottom threshold="200" color="primary"></ply-scroll-bottom>
 * <ply-scroll-bottom target="#chat" position="bottom-left"></ply-scroll-bottom>
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-scroll-bottom',
  templateUrl: './scroll-bottom.component.html',
  imports: [IconComponent, IconButtonDirective],
  host: { '[class]': 'hostClass()' },
})
export class ScrollBottomComponent extends ScrollButtonBase {
  /**
   * Accessible label for the button.
   *
   * @example
   * <ply-scroll-bottom ariaLabel="Jump to latest"></ply-scroll-bottom>
   */
  readonly ariaLabel = input('Scroll to bottom');

  protected shouldShow(scrollTop: number, maxScroll: number, threshold: number): boolean {
    if (maxScroll <= 0) return false;
    const distanceFromBottom = maxScroll - scrollTop;
    return distanceFromBottom > threshold;
  }

  protected destinationTop(scrollHeight: number, clientHeight: number): number {
    return Math.max(0, scrollHeight - clientHeight);
  }
}
