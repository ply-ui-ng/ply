import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../card/card.component';
import { IconComponent } from '../icon/icon.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';

export interface FormDeleteAccountSubmit {
  readonly confirmText: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-delete-account',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, CardComponent,
    InputGroupComponent, LabelComponent, BaseInputDirective,
    BaseButtonDirective, IconComponent
  ],
  templateUrl: './form-delete-account.component.html'
})
export class FormDeleteAccountComponent {
  readonly exportLink = input('/legal/export');
  readonly transferLink = input('/account/transfer');

  readonly submitted = output<FormDeleteAccountSubmit>();

  confirmText = '';

  get canDelete(): boolean {
    return this.confirmText === 'DELETE';
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.canDelete) {
      return;
    }
    this.submitted.emit({ confirmText: this.confirmText });
  }
}
