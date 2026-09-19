
import { Component, input ,
  ChangeDetectionStrategy
} from '@angular/core';

/**
 * A wrapper to center a spinner within a block or the entire page.
 * Provides a backdrop that can be dark or light.
 * 
 * @example
 * <ply-spinner-wrapper backdrop="dark">
 *   <ply-spinner></ply-spinner>
 * </ply-spinner-wrapper>
 */
@Component({
  selector: 'ply-spinner-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './spinner-wrapper.component.html'
})
export class SpinnerWrapperComponent {
  /**
   * Backdrop color: `dark` renders a dark overlay, `light` (the default) a light one.
   * @example
   * <ply-spinner-wrapper backdrop="dark">
   *   <ply-spinner></ply-spinner>
   * </ply-spinner-wrapper>
   */
  readonly backdrop = input<'dark' | 'light'>('light');
}
