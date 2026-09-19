import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComboboxComponent } from './combobox.component';
import { ComboboxOptionDirective } from './combobox-option.directive';
import { ComboboxOption } from '../types';

describe('ComboboxComponent', () => {
  let component: ComboboxComponent;
  let fixture: ComponentFixture<ComboboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComboboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComboboxComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', [
      { value: 'alpha', label: 'Alpha' },
      { value: 'beta', label: 'Beta' },
    ]);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters options locally', () => {
    component.onQueryInput('be');
    fixture.detectChanges();
    expect(component.filtered().map((o) => o.value)).toEqual(['beta']);
  });

  it('selects an option and emits the value', () => {
    const values: (string | null)[] = [];
    component.registerOnChange((v) => values.push(v));
    component.selectOption({ value: 'alpha', label: 'Alpha' });
    expect(values).toEqual(['alpha']);
    expect(component.selectedValue()).toBe('alpha');
  });

  it('honors the disabled input', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    component.openDropdown();
    expect(component.isOpen()).toBe(false);
  });

  it('opens the listbox in a viewport overlay', () => {
    component.openDropdown();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
    expect(document.querySelector('.cdk-overlay-pane')).toBeTruthy();
    expect(document.getElementById(component.listboxId)).toBeTruthy();
  });

  it('opens on ArrowDown and moves the active option', () => {
    const input = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
    expect(component.activeIndex()).toBe(0);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(component.activeIndex()).toBe(1);
  });

  it('selects the active option on Enter', () => {
    const values: (string | null)[] = [];
    component.registerOnChange((v) => values.push(v));
    const input = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement;

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(values).toEqual(['alpha']);
    expect(component.isOpen()).toBe(false);
  });

  it('closes the listbox on Escape', () => {
    const input = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });
});

@Component({
  standalone: true,
  imports: [ComboboxComponent, ComboboxOptionDirective],
  template: `
    <ply-combobox [options]="options">
      <ng-template plyComboboxOption let-option>
        <span class="option-tmpl">{{ option.label }}-custom</span>
      </ng-template>
    </ply-combobox>
  `,
})
class ComboboxOptionHostComponent {
  options: ComboboxOption[] = [
    { value: 'alpha', label: 'Alpha' },
    { value: 'beta', label: 'Beta' },
  ];
}

describe('ComboboxComponent option template', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('renders a projected option template in the overlay', () => {
    const fixture = TestBed.createComponent(ComboboxOptionHostComponent);
    fixture.detectChanges();
    const combobox = fixture.debugElement.children[0].componentInstance as ComboboxComponent;
    combobox.openDropdown();
    fixture.detectChanges();
    const custom = document.querySelectorAll('.option-tmpl');
    expect(custom.length).toBe(2);
    expect(custom[0].textContent?.trim()).toBe('Alpha-custom');
  });
});
