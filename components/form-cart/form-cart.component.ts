import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardBodyComponent } from '../card/card-body/card-body.component';
import { CardComponent } from '../card/card.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { StrokedButtonDirective } from '../button/ply-stroked-button.directive';

export interface FormCartSubmit {
  readonly tableQty: number;
  readonly chairQty: number;
  readonly method: 'card' | 'checkout';
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-cart',
  standalone: true,
  imports: [
    CommonModule, CardComponent, CardBodyComponent,
    BaseButtonDirective,
    StrokedButtonDirective],
  templateUrl: './form-cart.component.html'
})
export class FormCartComponent {
  readonly submitted = output<FormCartSubmit>();

  tableQty = 1;
  chairQty = 1;

  protected adjustTable(delta: number): void {
    this.tableQty = Math.max(1, this.tableQty + delta);
  }

  protected adjustChair(delta: number): void {
    this.chairQty = Math.max(1, this.chairQty + delta);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.emitSubmit('checkout');
  }

  protected payWithCard(): void {
    this.emitSubmit('card');
  }

  private emitSubmit(method: 'card' | 'checkout'): void {
    this.submitted.emit({
      tableQty: this.tableQty,
      chairQty: this.chairQty,
      method,
    });
  }
}
