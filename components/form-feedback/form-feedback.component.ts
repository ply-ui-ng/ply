import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../card/card.component';
import { IconComponent } from '../icon/icon.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { BaseAddonEndDirective } from '../input-group/ply-addon-end.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';
import { BaseTextareaDirective } from '../input-group/ply-textarea.directive';

export interface FormFeedbackSubmit {
  readonly name: string;
  readonly email: string;
  readonly type: string;
  readonly message: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-feedback',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardComponent,
    InputGroupComponent, LabelComponent, BaseInputDirective, BaseAddonEndDirective, IconComponent,
    BaseButtonDirective,
    BaseTextareaDirective],
  templateUrl: './form-feedback.component.html'
})
export class FormFeedbackComponent {
  readonly submitted = output<FormFeedbackSubmit>();

  name = '';
  email = '';
  type = 'General';
  message = '';

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit({
      name: this.name.trim(),
      email: this.email.trim(),
      type: this.type,
      message: this.message.trim(),
    });
  }
}
