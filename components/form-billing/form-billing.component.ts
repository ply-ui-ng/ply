import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeComponent } from '../badge/badge.component';
import { CardComponent } from '../card/card.component';
import { IconComponent } from '../icon/icon.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';

export interface FormBillingSubmit {
  readonly plan: string;
  readonly seats: number;
  readonly promoCode: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-billing',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardComponent,
    InputGroupComponent, LabelComponent, BaseInputDirective,
    BaseButtonDirective, BadgeComponent, IconComponent
  ],
  templateUrl: './form-billing.component.html'
})
export class FormBillingComponent {
  readonly submitted = output<FormBillingSubmit>();

  selectedPlan = signal<string>('pro');
  seats = signal<number>(5);
  promoCode = '';

  selectPlan(plan: string) {
    this.selectedPlan.set(plan);
  }

  increment() {
    this.seats.update(s => Math.min(s + 1, 100));
  }

  decrement() {
    this.seats.update(s => Math.max(s - 1, 1));
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit({
      plan: this.selectedPlan(),
      seats: this.seats(),
      promoCode: this.promoCode.trim(),
    });
  }
}
