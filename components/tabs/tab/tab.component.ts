import { Component, input, contentChild, model, ChangeDetectionStrategy } from '@angular/core';
import { TabBodyComponent } from '../tab-body/tab-body.component';
import { TabLabelComponent } from '../tab-label/tab-label.component';

let tabIdCounter = 0;

/**
 * The wrapper element for a single tab in a `ply-tabs` group.
 *
 * @example
 * <ply-tab label="Overview">
 *   <ply-tab-body>Content for Overview tab</ply-tab-body>
 * </ply-tab>
 */
@Component({
  selector: 'ply-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tab.component.html',
})
export class TabComponent {
  /** Stable id for the tab trigger element (aria-controls target). */
  readonly tabId = `ply-tab-${tabIdCounter}`;

  /** Stable id for the tab panel element (aria-labelledby target). */
  readonly panelId = `ply-tabpanel-${tabIdCounter++}`;

  /** A simple string label for the tab. If complex HTML is needed, project a `ply-tab-label` inside instead. */
  readonly label = input('');

  /** Tracks whether this tab is currently selected. */
  readonly isActive = model(false);

  /** Additional CSS classes to apply to the tab trigger. */
  readonly tabClass = input('cursor-pointer');

  readonly bodyComponent = contentChild(TabBodyComponent);
  readonly labelComponent = contentChild(TabLabelComponent);
}
