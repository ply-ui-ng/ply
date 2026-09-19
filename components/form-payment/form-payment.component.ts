import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardBodyComponent } from '../card/card-body/card-body.component';
import { CardComponent } from '../card/card.component';
import { IconComponent } from '../icon/icon.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { StrokedButtonDirective } from '../button/ply-stroked-button.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';

export interface FormPaymentSubmit {
  readonly method: 'visa' | 'paypal';
  readonly cardholderName: string;
  readonly cardNumber: string;
  readonly expiry: string;
  readonly cvv: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-payment',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardComponent, CardBodyComponent,
    InputGroupComponent, LabelComponent, BaseInputDirective, IconComponent,
    BaseButtonDirective,
    StrokedButtonDirective],
  templateUrl: './form-payment.component.html'
})
export class FormPaymentComponent {
  readonly submitted = output<FormPaymentSubmit>();

  method: 'visa' | 'paypal' = 'visa';
  cardholderName = '';
  cardNumber = '';
  expiry = '';
  cvv = '';

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit({
      method: this.method,
      cardholderName: this.cardholderName.trim(),
      cardNumber: this.cardNumber.trim(),
      expiry: this.expiry.trim(),
      cvv: this.cvv.trim(),
    });
  }
}
