import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../card/card.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';

export interface FormSignupSubmit {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardComponent,
    InputGroupComponent,
    LabelComponent,
    BaseInputDirective,
    BaseButtonDirective,
  ],
  templateUrl: './form-signup.component.html'
})
export class FormSignupComponent {
  readonly heading = input('Sign Up');
  readonly submitLabel = input('Sign Up');
  readonly footerHint = input('Already have an account?');
  readonly footerLabel = input('Log in');
  readonly footerLink = input('/login');

  readonly submitted = output<FormSignupSubmit>();

  firstName = '';
  lastName = '';
  email = '';
  password = '';

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit({
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      password: this.password,
    });
  }
}
