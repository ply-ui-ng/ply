import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BadgeComponent } from '../badge/badge.component';
import { CardComponent } from '../card/card.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { IconComponent } from '../icon/icon.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';

export interface FormWizardSubmit {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;
  readonly plan: string;
  readonly acceptTerms: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-wizard',
  standalone: true,
  imports: [
    FormsModule, RouterLink,
    CardComponent,
    InputGroupComponent, LabelComponent, BaseInputDirective,
    BaseButtonDirective, BadgeComponent, IconComponent, CheckboxComponent
  ],
  templateUrl: './form-wizard.component.html'
})
export class FormWizardComponent {
  readonly termsLink = input('/legal/terms');
  readonly privacyLink = input('/legal/privacy');

  readonly submitted = output<FormWizardSubmit>();

  currentStep = signal<number>(0);
  selectedPlan = signal<string>('pro');

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  acceptTerms = false;

  steps = [
    { label: 'Account' },
    { label: 'Plan' },
    { label: 'Confirm' }];

  next() {
    if (this.currentStep() < 2) {
      this.currentStep.update(s => s + 1);
    }
  }

  back() {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
    }
  }

  selectPlan(plan: string) {
    this.selectedPlan.set(plan);
  }

  protected planPrice(): string {
    return this.selectedPlan() === 'starter' ? '$9/mo' : '$29/mo';
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.currentStep() !== 2) {
      return;
    }
    this.submitted.emit({
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      password: this.password,
      plan: this.selectedPlan(),
      acceptTerms: this.acceptTerms,
    });
  }
}
