import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../card/card.component';
import { IconComponent } from '../icon/icon.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';

export interface FormNewsletterSubmit {
  readonly email: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-newsletter',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardComponent,
    InputGroupComponent, BaseInputDirective, IconComponent,
    BaseButtonDirective],
  templateUrl: './form-newsletter.component.html'
})
export class FormNewsletterComponent {
  readonly submitted = output<FormNewsletterSubmit>();

  email = '';

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit({ email: this.email.trim() });
  }
}
