import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../card/card.component';
import { IconComponent } from '../icon/icon.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { BaseAddonEndDirective } from '../input-group/ply-addon-end.directive';
import { BaseAddonStartDirective } from '../input-group/ply-addon-start.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';

interface FilterChip {
  label: string;
  active: boolean;
}

export interface FormFilterSubmit {
  readonly search: string;
  readonly statuses: string[];
  readonly tags: string[];
  readonly from: string;
  readonly to: string;
  readonly sort: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-form-filter',
  standalone: true,
  imports: [
    FormsModule,
    CardComponent,
    InputGroupComponent, LabelComponent, BaseInputDirective,
    BaseButtonDirective, IconComponent, BaseAddonEndDirective, BaseAddonStartDirective
  ],
  templateUrl: './form-filter.component.html'
})
export class FormFilterComponent {
  readonly submitted = output<FormFilterSubmit>();

  search = '';
  from = '';
  to = '';
  sort = 'Newest first';

  readonly statuses = signal<FilterChip[]>([
    { label: 'Active', active: true },
    { label: 'Pending', active: false },
    { label: 'Inactive', active: false },
    { label: 'Draft', active: true },
  ]);

  readonly tags = signal<FilterChip[]>([
    { label: 'Frontend', active: true },
    { label: 'Backend', active: false },
    { label: 'Design', active: false },
    { label: 'Marketing', active: false },
    { label: 'Mobile', active: true },
  ]);

  readonly activeCount = computed(() =>
    this.statuses().filter((s) => s.active).length + this.tags().filter((t) => t.active).length
  );

  toggleStatus(i: number) {
    this.statuses.update((items) =>
      items.map((item, index) => index === i ? { ...item, active: !item.active } : item)
    );
  }

  toggleTag(i: number) {
    this.tags.update((items) =>
      items.map((item, index) => index === i ? { ...item, active: !item.active } : item)
    );
  }

  clearAll() {
    this.search = '';
    this.from = '';
    this.to = '';
    this.sort = 'Newest first';
    this.statuses.update((items) => items.map((item) => ({ ...item, active: false })));
    this.tags.update((items) => items.map((item) => ({ ...item, active: false })));
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit({
      search: this.search.trim(),
      statuses: this.statuses().filter((s) => s.active).map((s) => s.label),
      tags: this.tags().filter((t) => t.active).map((t) => t.label),
      from: this.from,
      to: this.to,
      sort: this.sort,
    });
  }
}
