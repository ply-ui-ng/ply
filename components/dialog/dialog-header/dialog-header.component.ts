import { Component ,
  ChangeDetectionStrategy
} from '@angular/core';


/**
 * A header section for a dialog, rendered as part of `ply-dialog`.
 *
 * @example
 * <ply-dialog-header>
 *   <h3>Modal Title</h3>
 * </ply-dialog-header>
 */
@Component({
  selector: 'ply-dialog-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './dialog-header.component.html'
})
export class DialogHeaderComponent {}
