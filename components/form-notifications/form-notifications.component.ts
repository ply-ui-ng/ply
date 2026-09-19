import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardBodyComponent } from '../card/card-body/card-body.component';
import { CardComponent } from '../card/card.component';
import { IconComponent } from '../icon/icon.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { ToggleComponent } from '../toggle/toggle.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { StrokedButtonDirective } from '../button/ply-stroked-button.directive';
import { BaseAddonEndDirective } from '../input-group/ply-addon-end.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';

export interface FormNotificationsSubmit {
  readonly mentions: boolean;
  readonly follows: boolean;
  readonly otherActivity: boolean;
  readonly weeklyProduct: boolean;
  readonly newsletter: boolean;
  readonly cardholderName: string;
  readonly email: string;
  readonly addToContacts: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-notifications',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardComponent, CardBodyComponent,
    InputGroupComponent, LabelComponent, BaseInputDirective, BaseAddonEndDirective, IconComponent,
    BaseButtonDirective,
    ToggleComponent, StrokedButtonDirective],
  templateUrl: './form-notifications.component.html'
})
export class FormNotificationsComponent {
  readonly submitted = output<FormNotificationsSubmit>();

  mentions = true;
  follows = false;
  otherActivity = false;
  weeklyProduct = true;
  newsletter = false;
  cardholderName = '';
  email = '';
  addToContacts = true;

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit({
      mentions: this.mentions,
      follows: this.follows,
      otherActivity: this.otherActivity,
      weeklyProduct: this.weeklyProduct,
      newsletter: this.newsletter,
      cardholderName: this.cardholderName.trim(),
      email: this.email.trim(),
      addToContacts: this.addToContacts,
    });
  }
}
