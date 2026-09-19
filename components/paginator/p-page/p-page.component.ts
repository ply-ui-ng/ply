import { CommonModule } from '@angular/common';
import { Component, input ,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';

/**
 * Represents an individual page number button inside a `ply-paginator`.
 *
 * @example
 * <ply-p-page [active]="true">1</ply-p-page>
 */
@Component({
  selector: 'ply-p-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './p-page.component.html'
})
export class PPageComponent {
  /** Indicates if this page is currently the active/selected page. */
  readonly active = input(false, { transform: booleanAttribute });
}
