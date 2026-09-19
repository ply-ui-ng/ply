import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepperComponent } from './stepper.component';
import { StepComponent } from './step/step.component';

@Component({
  standalone: true,
  imports: [StepperComponent, StepComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ply-stepper>
      <ply-step label="One">
        <p>Real content for step one</p>
      </ply-step>
      <ply-step label="Two">
        <p>Real content for step two</p>
      </ply-step>
      <ply-step label="Three">
        <p>Real content for step three</p>
      </ply-step>
    </ply-stepper>
  `
})
class StepperHostComponent {
  @ViewChild(StepperComponent) stepper!: StepperComponent;
}

@Component({
  standalone: true,
  imports: [StepperComponent, StepComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ply-stepper hideNavigation>
      <ply-step label="One"><p>Step one</p></ply-step>
    </ply-stepper>
  `,
})
class StepperHideNavHostComponent {}

describe('StepperComponent (real projected content)', () => {
  let fixture: ComponentFixture<StepperHostComponent>;
  let host: StepperHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StepperHostComponent] });
    fixture = TestBed.createComponent(StepperHostComponent);
    host = fixture.componentInstance;
  });

  it('should render the active step content without throwing', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Real content for step one');
  });

  it('should re-render projected content via ngTemplateOutlet across step transitions without throwing', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(() => {
      host.stepper.next();
      fixture.detectChanges();
    }).not.toThrow();
    expect(el.textContent).toContain('Real content for step two');

    expect(() => {
      host.stepper.next();
      fixture.detectChanges();
    }).not.toThrow();
    expect(el.textContent).toContain('Real content for step three');

    expect(() => {
      host.stepper.previous();
      fixture.detectChanges();
    }).not.toThrow();
    expect(el.textContent).toContain('Real content for step two');

    expect(() => {
      host.stepper.goToStep(0);
      fixture.detectChanges();
    }).not.toThrow();
    expect(el.textContent).toContain('Real content for step one');
  });
});

describe('StepperComponent boolean input coercion', () => {
  it('coerces hideNavigation from a bare attribute', () => {
    TestBed.configureTestingModule({ imports: [StepperHideNavHostComponent] });
    const fixture = TestBed.createComponent(StepperHideNavHostComponent);
    fixture.detectChanges();
    const stepper = fixture.debugElement.children[0].componentInstance as StepperComponent;
    expect(stepper.hideNavigation()).toBe(true);
  });
});
