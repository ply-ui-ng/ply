import { Component, input ,
  ChangeDetectionStrategy
} from '@angular/core';

import { IconComponent } from '../icon/icon.component';

/**
 * A standard layout component to display when a list or view has no data.
 * Centers an icon, title, and description.
 * 
 * @example
 * <ply-empty-state 
 *   iconName="inbox" 
 *   title="No Messages" 
 *   description="You have read all your messages.">
 * </ply-empty-state>
 */
@Component({
  selector: 'ply-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './empty-state.component.html'
})
export class EmptyStateComponent {
  /** The name of the SVG icon to display at the top. */
  readonly iconName = input<string>();
  
  /** The primary heading text. */
  readonly title = input<string>();
  
  /** The secondary body text explaining the empty state. */
  readonly description = input<string>();
}
