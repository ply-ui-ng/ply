import { Component, TemplateRef, viewChild ,
  ChangeDetectionStrategy
} from '@angular/core';

/**
 * The actual content wrapper for a `ply-tab`. 
 * Content inside this tag is only rendered/visible when the parent tab is active.
 *
 * @example
 * <ply-tab-body>Content visible when tab is active</ply-tab-body>
 */
@Component({
  selector: 'ply-tab-body',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tab-body.component.html'
})
export class TabBodyComponent {
  readonly bodyContent = viewChild.required(TemplateRef);
}
