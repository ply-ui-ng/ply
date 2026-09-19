import { Component ,
  ChangeDetectionStrategy
} from '@angular/core';


/**
 * A footer section for a dialog, rendered as part of `ply-dialog`.
 *
 * @example
 * <ply-dialog-footer>
 *   <button ply-button color="primary">Save</button>
 * </ply-dialog-footer>
 */
@Component({
  selector: 'ply-dialog-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './dialog-footer.component.html'
})
export class DialogFooterComponent {}
