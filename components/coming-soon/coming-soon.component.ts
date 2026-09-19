import { Component, input ,
  ChangeDetectionStrategy
} from '@angular/core';

import { IconComponent } from '../icon/icon.component';

/**
 * A placeholder component used to indicate that a feature or page is under construction.
 * Displays a shimmer effect and customizable text.
 * 
 * @example
 * <ply-coming-soon 
 *   title="Dashboard Analytics" 
 *   description="We're currently building advanced reporting features. Check back soon!">
 * </ply-coming-soon>
 */
@Component({
  selector: 'ply-coming-soon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './coming-soon.component.html',
})
export class ComingSoonComponent {
  /** The primary heading text to display. */
  readonly title = input<string>('');
  
  /** The secondary descriptive text providing more context. */
  readonly description = input<string>('');
}
