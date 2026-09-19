import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardBodyComponent } from '../card/card-body/card-body.component';
import { CardComponent } from '../card/card.component';
import { IconComponent } from '../icon/icon.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { StarComponent } from '../star-rating/star/star.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';
import { BaseTextareaDirective } from '../input-group/ply-textarea.directive';

export interface FormReviewSubmit {
  readonly rating: number;
  readonly title: string;
  readonly review: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-review',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardComponent, CardBodyComponent,
    InputGroupComponent, LabelComponent, BaseInputDirective, IconComponent,
    BaseButtonDirective,
    StarRatingComponent, StarComponent,
    BaseTextareaDirective],
  templateUrl: './form-review.component.html'
})
export class FormReviewComponent {
  readonly submitted = output<FormReviewSubmit>();

  rating = 4;
  title = '';
  review = '';

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit({
      rating: this.rating,
      title: this.title.trim(),
      review: this.review.trim(),
    });
  }
}
