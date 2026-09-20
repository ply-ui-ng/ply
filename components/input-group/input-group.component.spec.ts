import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputGroupComponent } from './input-group.component';
import { LabelComponent } from './label/label.component';
import { ErrorComponent } from './error/error.component';
import { BaseInputDirective } from './ply-input.directive';

@Component({
  standalone: true,
  imports: [
    InputGroupComponent,
    LabelComponent,
    ErrorComponent,
    BaseInputDirective,
    ReactiveFormsModule,
  ],
  template: `
    <form [formGroup]="form">
      <ply-input-group>
        <ply-label>Name</ply-label>
        <input ply-input formControlName="name" />
        <ply-error>Required</ply-error>
      </ply-input-group>
    </form>
  `,
})
class ReactiveHostComponent {
  readonly form = new FormGroup({
    name: new FormControl('', Validators.required),
  });
}

describe('InputGroupComponent', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [InputGroupComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(InputGroupComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    fixture.destroy();
  });

  it('hides reactive errors until the control is touched', async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveHostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(ReactiveHostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ply-error')).toBeNull();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    fixture.componentInstance.form.controls.name.markAsTouched();
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ply-error')?.textContent).toContain('Required');
    fixture.destroy();
  });

  it('puts the focus ring on the wrapper so addons sit inside it', async () => {
    await TestBed.configureTestingModule({
      imports: [InputGroupComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(InputGroupComponent);
    fixture.detectChanges();
    const cls = fixture.componentInstance.getWrapperClasses();
    expect(cls).toContain('border-[var(--ply-border)]');
    expect(cls).toContain('bg-[var(--ply-background)]');
    expect(cls).toContain('shadow-sm');
    expect(cls).toContain('focus-within:ring-2!');
    expect(cls).toContain('focus-within:ring-inset!');
    fixture.destroy();
  });
});
