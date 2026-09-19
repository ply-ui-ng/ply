import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardBodyComponent } from '../card/card-body/card-body.component';
import { CardComponent } from '../card/card.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { IconComponent } from '../icon/icon.component';
import { BaseButtonDirective } from '../button/ply-button.directive';

export interface FormCheckoutSummarySubmit {
  readonly payment: 'visa' | 'paypal';
  readonly acceptTerms: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-checkout-summary',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, CardComponent, CardBodyComponent,
    IconComponent,
    CheckboxComponent, BaseButtonDirective],
  templateUrl: './form-checkout-summary.component.html'
})
export class FormCheckoutSummaryComponent {
  readonly termsLink = input('/legal/terms');

  readonly submitted = output<FormCheckoutSummarySubmit>();

  payment: 'visa' | 'paypal' = 'visa';
  acceptTerms = false;

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit({
      payment: this.payment,
      acceptTerms: this.acceptTerms,
    });
  }
}
