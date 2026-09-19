import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeComponent } from '../badge/badge.component';
import { CardComponent } from '../card/card.component';
import { IconComponent } from '../icon/icon.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { BaseAddonEndDirective } from '../input-group/ply-addon-end.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';

export interface FormTeamInviteSubmit {
  readonly email: string;
  readonly role: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-team-invite',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardComponent,
    InputGroupComponent, LabelComponent, BaseInputDirective,
    BaseButtonDirective, BadgeComponent, IconComponent, BaseAddonEndDirective
  ],
  templateUrl: './form-team-invite.component.html'
})
export class FormTeamInviteComponent {
  readonly submitted = output<FormTeamInviteSubmit>();

  email = '';
  role = 'Member';

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit({
      email: this.email.trim(),
      role: this.role,
    });
  }
}
