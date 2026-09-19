import { Component, model ,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * A body section for a dialog, rendered as part of `ply-dialog`.
 *
 * @example
 * <ply-dialog-body>
 *   <p>Dialog content goes here.</p>
 * </ply-dialog-body>
 */
@Component({
  selector: 'ply-dialog-body',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './dialog-body.component.html'
})
export class DialogBodyComponent {
  readonly height = model<number>();
}
