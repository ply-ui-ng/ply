import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../card/card.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';

export interface FormLoginSubmit {
  readonly email: string;
  readonly password: string;
  readonly remember: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardComponent,
    InputGroupComponent,
    LabelComponent,
    BaseInputDirective,
    CheckboxComponent,
    BaseButtonDirective,
  ],
  templateUrl: './form-login.component.html'
})
export class FormLoginComponent {
  readonly heading = input('Login');
  readonly submitLabel = input('Sign In');
  readonly forgotLink = input('/forgot-password');
  readonly footerHint = input("Don't have an account?");
  readonly footerLabel = input('Sign up');
  readonly footerLink = input('/register');

  readonly submitted = output<FormLoginSubmit>();

  email = '';
  password = '';
  remember = false;

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit({
      email: this.email.trim(),
      password: this.password,
      remember: this.remember,
    });
  }
}
