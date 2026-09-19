import { Component, OnInit, input ,
  ChangeDetectionStrategy
} from '@angular/core';

import { InputGroupComponent } from '../input-group/input-group.component';
import { BaseInputDirective } from '../input-group/ply-input.directive';
import { IconComponent } from '../icon/icon.component';

/**
 * A wrapper component that combines an input field with a native HTML datalist for autocomplete suggestions.
 * 
 * @example
 * <ply-input-autocomplete suggestions="country-list">
 *   <option value="United States"></option>
 *   <option value="Canada"></option>
 * </ply-input-autocomplete>
 */
@Component({
  selector: 'ply-input-autocomplete',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputGroupComponent, BaseInputDirective, IconComponent],
  templateUrl: './input-autocomplete.component.html'
})
export class InputAutocompleteComponent implements OnInit {
  /** A unique ID string to link the input list attribute with the datalist id. */
  readonly suggestions = input('');
  
  list = '';
  id = '';

  ngOnInit(): void {
    this.list = this.suggestions();
    this.id = this.suggestions();
  }
}
