import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarComponent } from '../avatar/avatar.component';
import { CardBodyComponent } from '../card/card-body/card-body.component';
import { CardComponent } from '../card/card.component';
import { IconComponent } from '../icon/icon.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { IconStrokedButtonDirective } from '../button/ply-icon-stroked-button.directive';
import { BaseAddonEndDirective } from '../input-group/ply-addon-end.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';
import { BaseTextareaDirective } from '../input-group/ply-textarea.directive';

export interface FormProfileSettingsSubmit {
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly email: string;
  readonly country: string;
  readonly state: string;
  readonly zipcode: string;
  readonly area: string;
  readonly bio: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-profile-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardComponent, CardBodyComponent,
    InputGroupComponent, LabelComponent, BaseInputDirective, BaseAddonEndDirective, IconComponent,
    BaseButtonDirective, IconButtonDirective, IconStrokedButtonDirective,
    BaseTextareaDirective, AvatarComponent
  ],
  templateUrl: './form-profile-settings.component.html'
})
export class FormProfileSettingsComponent {
  readonly submitted = output<FormProfileSettingsSubmit>();

  firstName = 'Sarah';
  lastName = 'Mitchell';
  phone = '+1 (555) 123-4567';
  email = 'sarah@example.com';
  country = 'United States';
  state = 'California';
  zipcode = '94301';
  area = 'Silicon Valley';
  bio = 'Digital product designer based in San Francisco. Passionate about minimalism and user-centric design.';

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit({
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      phone: this.phone.trim(),
      email: this.email.trim(),
      country: this.country,
      state: this.state,
      zipcode: this.zipcode.trim(),
      area: this.area.trim(),
      bio: this.bio.trim(),
    });
  }
}
