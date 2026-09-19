import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardBodyComponent } from '../card/card-body/card-body.component';
import { CardComponent } from '../card/card.component';
import { IconComponent } from '../icon/icon.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { StrokedButtonDirective } from '../button/ply-stroked-button.directive';
import { BaseAddonEndDirective } from '../input-group/ply-addon-end.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';
import { BaseTextareaDirective } from '../input-group/ply-textarea.directive';

export interface FormShippingSubmit {
  readonly delivery: 'free' | 'express';
  readonly address: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly email: string;
  readonly country: string;
  readonly state: string;
  readonly city: string;
  readonly zipcode: string;
  readonly area: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-shipping',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardComponent, CardBodyComponent,
    InputGroupComponent, LabelComponent, BaseInputDirective, BaseAddonEndDirective, IconComponent,
    StrokedButtonDirective,
    BaseTextareaDirective],
  templateUrl: './form-shipping.component.html'
})
export class FormShippingComponent {
  readonly submitted = output<FormShippingSubmit>();

  delivery: 'free' | 'express' = 'free';
  address = '';
  firstName = '';
  lastName = '';
  phone = '';
  email = '';
  country = 'United States';
  state = 'California';
  city = 'Palo Alto';
  zipcode = '';
  area = '';

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit({
      delivery: this.delivery,
      address: this.address.trim(),
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      phone: this.phone.trim(),
      email: this.email.trim(),
      country: this.country,
      state: this.state,
      city: this.city,
      zipcode: this.zipcode.trim(),
      area: this.area.trim(),
    });
  }
}
