import { Component, TemplateRef, viewChild, signal ,
  ChangeDetectionStrategy
} from '@angular/core';


import { IconComponent } from '../../icon/icon.component';

/**
 * A custom label for a `ply-tab`. Allows you to add rich content (icons, badges, etc.) as the tab label.
 *
 * @example
 * <ply-tab>
 *   <ply-tab-label>
 *     <ply-icon name="settings"></ply-icon>
 *     Settings
 *   </ply-tab-label>
 *   <ply-tab-body>Content</ply-tab-body>
 * </ply-tab>
 */
@Component({
  selector: 'ply-tab-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './tab-label.component.html'
})
export class TabLabelComponent {
  // These are set by TabComponent or parent
  readonly icon = signal<string | undefined>(undefined);
  readonly icon_position = signal<string | undefined>(undefined);
  readonly isActive = signal(false);
  readonly type = signal<string | undefined>(undefined);

  readonly labelContent = viewChild.required(TemplateRef);
}
