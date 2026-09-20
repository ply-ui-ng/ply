import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CollapsibleComponent } from './collapsible.component';

/**
 * Body of a `ply-collapsible`. Hidden when the parent is closed.
 *
 * @example
 * <ply-collapsible-content>Optional details.</ply-collapsible-content>
 */
@Component({
  selector: 'ply-collapsible-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collapsible-content.component.html',
  host: { class: 'block' },
})
export class CollapsibleContentComponent {
  readonly collapsible = inject(CollapsibleComponent);
}
