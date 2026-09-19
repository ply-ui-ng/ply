import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../card/card.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { IconComponent } from '../icon/icon.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { TabBodyComponent } from '../tabs/tab-body/tab-body.component';
import { TabLabelComponent } from '../tabs/tab-label/tab-label.component';
import { TabComponent } from '../tabs/tab/tab.component';
import { TabsComponent } from '../tabs/tabs.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { IconStrokedButtonDirective } from '../button/ply-icon-stroked-button.directive';
import { BaseLinkDirective } from '../button/ply-link.directive';
import { BaseAddonEndDirective } from '../input-group/ply-addon-end.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';

export interface FormLoginTabsSubmit {
  readonly mode: 'signup' | 'login';
  readonly name?: string;
  readonly lastname?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly password: string;
  readonly confirmPassword?: string;
  readonly acceptTerms?: boolean;
  readonly login?: string;
  readonly remember?: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-login-tabs',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, CardComponent, TabsComponent, TabComponent, TabLabelComponent, TabBodyComponent,
    InputGroupComponent, LabelComponent, BaseInputDirective, BaseAddonEndDirective, IconComponent,
    CheckboxComponent, BaseButtonDirective, IconStrokedButtonDirective,
    BaseLinkDirective],
  templateUrl: './form-login-tabs.component.html'
})
export class FormLoginTabsComponent {
  readonly termsLink = input('/legal/terms');
  readonly forgotLink = input('/forgot-password');

  readonly submitted = output<FormLoginTabsSubmit>();

  name = '';
  lastname = '';
  phone = '';
  email = '';
  signupPassword = '';
  confirmPassword = '';
  acceptTerms = false;

  login = '';
  loginPassword = '';
  remember = false;

  protected onSignupSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit({
      mode: 'signup',
      name: this.name.trim(),
      lastname: this.lastname.trim(),
      phone: this.phone.trim(),
      email: this.email.trim(),
      password: this.signupPassword,
      confirmPassword: this.confirmPassword,
      acceptTerms: this.acceptTerms,
    });
  }

  protected onLoginSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit({
      mode: 'login',
      login: this.login.trim(),
      password: this.loginPassword,
      remember: this.remember,
    });
  }
}
