import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SelectComponent } from './select.component';
import { FormsModule } from '@angular/forms';

/**
 * The TestHostComponent component.
 * @example <undefined></undefined>
 */
@Component({
  template: `
    <ply-select [(ngModel)]="value">
      <option value="option-1">Option 1</option>
      <option value="option-2">Option 2</option>
    </ply-select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectComponent, FormsModule],
})
class TestHostComponent {
  value: string | undefined;
}

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should write value via ControlValueAccessor', () => {
    component.writeValue('option-1');
    expect(component.value()).toBe('option-1');
  });

  it('should call onChange when selection changes', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);

    component.onSelectChange({ target: { value: 'option-2' } } as unknown as Event);
    expect(onChange).toHaveBeenCalledWith('option-2');
  });

  it('should set disabled state via ControlValueAccessor', () => {
    component.setDisabledState(true);
    expect(component.isDisabled()).toBe(true);
  });
});

@Component({
  template: `
    <ply-select [(ngModel)]="value">
      @for (item of items; track item.value) {
        <option [value]="item.value">{{ item.label }}</option>
      }
    </ply-select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectComponent, FormsModule],
})
class DynamicOptionsHostComponent {
  value = 'in_progress';
  items = [
    { value: 'triage', label: 'Triage' },
    { value: 'in_progress', label: 'In progress' },
  ];
}

describe('SelectComponent projected options', () => {
  it('should show the ngModel value on a native select with @for options', async () => {
    TestBed.configureTestingModule({
      imports: [DynamicOptionsHostComponent],
    });
    const fixture = TestBed.createComponent(DynamicOptionsHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.options.length).toBe(2);
    expect(select.value).toBe('in_progress');
  });
});
