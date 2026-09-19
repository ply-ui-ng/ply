import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadioGroupComponent } from '../radio-group.component';
import { RadioButtonComponent } from './radio-button.component';

@Component({
  template: `
    <ply-radio-group groupLabel="Plan">
      <ply-radio-button value="basic">Basic</ply-radio-button>
      <ply-radio-button value="pro">Pro</ply-radio-button>
    </ply-radio-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RadioGroupComponent, RadioButtonComponent],
})
class RadioGroupHostComponent {}

describe('RadioButtonComponent a11y', () => {
  let fixture: ComponentFixture<RadioGroupHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioGroupHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RadioGroupHostComponent);
    fixture.detectChanges();
  });

  it('renders a radiogroup with a shared native name on all options', () => {
    const group = fixture.nativeElement.querySelector('[role="radiogroup"]') as HTMLElement;
    expect(group).toBeTruthy();
    expect(group.getAttribute('aria-labelledby')).toBeTruthy();

    const inputs = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="radio"]')
    ) as HTMLInputElement[];

    expect(inputs.length).toBe(2);
    expect(inputs[0].name).toBeTruthy();
    expect(inputs[0].name).toBe(inputs[1].name);
  });
});
