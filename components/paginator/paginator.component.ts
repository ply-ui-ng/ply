
import { Component, input, signal ,
  ChangeDetectionStrategy, booleanAttribute, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { SelectComponent } from '../select/select.component';
import { InputSpinnerComponent } from '../input-spinner/input-spinner.component';
import { BASE_UI_I18N } from '../i18n/i18n';

/**
 * A pagination control component.
 * Allows users to navigate between pages of data and change the page size.
 * Previous/next labels come from `provideBaseUiI18n()`.
 * 
 * @example
 * <ply-paginator [plyPaginator]="true" [pageSizeOptions]="[10, 20, 50]"></ply-paginator>
 */
@Component({
  selector: 'ply-paginator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    IconComponent,
    IconButtonDirective,
    SelectComponent,
    InputSpinnerComponent
],
  templateUrl: './paginator.component.html'
})
export class PaginatorComponent {
  protected readonly i18n = inject(BASE_UI_I18N);

  /** If true, applies a distinct "base" visual variant. */
  readonly plyPaginator = input(false, { transform: booleanAttribute });
  
  /** If true, shows explicit previous/next arrow buttons instead of standard pagination. */
  readonly arrows = input(false, { transform: booleanAttribute });
  
  /** The currently selected number of items per page. */
  readonly itemsPerPage = input<string | number | null>(null);
  
  /** The available options for "items per page" dropdown. Defaults to [10, 25, 50, 100]. */
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  
  /** First/last visible page counters; template-read, so they must be signals. */
  readonly start = signal(1);
  readonly end = signal(125);

  decrease() {
    if (this.start() < this.end()) {
      this.end.update(v => v - 1);
      this.start.update(v => v + 1);
    }
  }

  increase() {
    if (this.start() > 1) {
      this.start.update(v => v - 1);
      this.end.update(v => v + 1);
    }
  }
}
