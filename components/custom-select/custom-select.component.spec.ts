import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomSelectComponent } from './custom-select.component';
import { CustomSelectOptionDirective } from './custom-select-option.directive';

describe('CustomSelectComponent a11y', () => {
  let fixture: ComponentFixture<CustomSelectComponent>;
  let component: CustomSelectComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomSelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Favorite car');
    fixture.componentRef.setInput('options', [
      { label: 'Tesla', value: 'tesla' },
      { label: 'BMW', value: 'bmw' },
      { label: 'Audi', value: 'audi' },
    ]);
    fixture.componentRef.setInput('displayKey', 'label');
    fixture.componentRef.setInput('valueKey', 'value');
    fixture.detectChanges();
  });

  it('exposes combobox and listbox roles when open', () => {
    const button = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-haspopup')).toBe('listbox');
    expect(button.getAttribute('aria-labelledby')).toBeTruthy();

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('[role="listbox"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('[role="option"]').length).toBe(3);
  });

  it('moves active option with arrow keys and selects with Enter', () => {
    const button = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLButtonElement;
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(component.activeDescendant()).toContain('-option-1');

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(component.selectedOption()).toBe('bmw');
    expect(component.isOpen()).toBe(false);
  });

  it('closes the listbox on Escape', () => {
    const button = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLButtonElement;
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });
});

@Component({
  standalone: true,
  imports: [CustomSelectComponent, CustomSelectOptionDirective],
  template: `
    <ply-custom-select [options]="options" displayKey="label" valueKey="value">
      <ng-template plySelectOption let-option let-label="label">
        <span class="select-option-tmpl">{{ label }}-custom</span>
      </ng-template>
    </ply-custom-select>
  `,
})
class SelectOptionHostComponent {
  options = [
    { label: 'Tesla', value: 'tesla' },
    { label: 'BMW', value: 'bmw' },
  ];
}

describe('CustomSelectComponent option template', () => {
  it('renders a projected option template in the listbox', () => {
    const fixture = TestBed.createComponent(SelectOptionHostComponent);
    fixture.detectChanges();
    const select = fixture.debugElement.children[0].componentInstance as CustomSelectComponent;
    select.openDropdown();
    fixture.detectChanges();
    const custom = fixture.nativeElement.querySelectorAll('.select-option-tmpl');
    expect(custom.length).toBe(2);
    expect(custom[0].textContent.trim()).toBe('Tesla-custom');
  });
});
