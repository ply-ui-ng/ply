import { Component ,
  ChangeDetectionStrategy
} from '@angular/core';

/**
 * The clickable header of an accordion item that toggles the body visibility.
 * 
 * @example
 * <ply-accordion-item-header>
 *   Section Title
 * </ply-accordion-item-header>
 */
@Component({
  selector: 'ply-accordion-item-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accordion-item-header.component.html'
})
export class AccordionItemHeaderComponent {}
