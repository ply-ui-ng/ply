import {Component, ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import { IconComponent } from '../icon/icon.component';
import { BaseButtonDirective } from '../button/ply-button.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-success-message',
  standalone: true,
  imports: [
    CommonModule, CardComponent,      
        IconComponent, 
     BaseButtonDirective],
  templateUrl: './form-success-message.component.html'
})
export class FormSuccessMessageComponent {
}
