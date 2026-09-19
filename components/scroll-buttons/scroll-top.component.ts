import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { ScrollButtonBase } from './scroll-button.base';

/**
 * Floating “scroll to top” button that appears after the user scrolls past a threshold.
 *
 * @example
 * <ply-scroll-top threshold="400" color="primary"></ply-scroll-top>
 * <ply-scroll-top target="#panel" [fixed]="false"></ply-scroll-top>
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-scroll-top',
  templateUrl: './scroll-top.component.html',
  imports: [IconComponent, IconButtonDirective],
  host: { '[class]': 'hostClass()' },
})
export class ScrollTopComponent extends ScrollButtonBase {
  /**
   * Accessible label for the button.
   *
   * @example
   * <ply-scroll-top ariaLabel="Back to top"></ply-scroll-top>
   */
  readonly ariaLabel = input('Scroll to top');

  protected shouldShow(scrollTop: number, _maxScroll: number, threshold: number): boolean {
    return scrollTop > threshold;
  }

  protected destinationTop(_scrollHeight: number, _clientHeight: number): number {
    return 0;
  }
}
