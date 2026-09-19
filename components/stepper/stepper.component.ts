import { Component, input, output, contentChildren, model ,
  ChangeDetectionStrategy, effect, booleanAttribute, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { StepComponent } from './step/step.component';
import { IconComponent } from '../icon/icon.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { StrokedButtonDirective } from '../button/ply-stroked-button.directive';
import { cn } from '../tw-merge/tw-merge';

/**
 * A multi-step workflow container component.
 * Automatically handles step transitions, active state, and visual progress lines.
 * 
 * @example
 * <ply-stepper linear hideNavigation (stepChange)="onStep($event)">
 *   <ply-step label="Step 1" description="First step">...</ply-step>
 *   <ply-step label="Step 2" description="Second step">...</ply-step>
 * </ply-stepper>
 */
@Component({
  selector: 'ply-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, IconComponent, BaseButtonDirective, StrokedButtonDirective],
  templateUrl: './stepper.component.html'
})
export class StepperComponent {
  /** Queries all `ply-step` elements inside this stepper. */
  readonly steps = contentChildren(StepComponent);
  
  /** The zero-based index of the currently active step. */
  readonly activeStepIndex = model(0);
  
  /** If true, the user is restricted from jumping ahead to uncompleted steps. */
  readonly linear = input(false, { transform: booleanAttribute });

  /** If true, hides the internal 'Next', 'Back', and 'Submit' buttons. Accepts a bare attribute (`hideNavigation`). */
  readonly hideNavigation = input(false, { transform: booleanAttribute });
  
  /** Emitted whenever the active step index changes. */
  readonly stepChange = output<number>();
  
  /** Emitted when the stepper is submitted on the final step. */
  readonly stepperSubmit = output<void>();

  /** The title displayed on the success screen after submission. */
  readonly successTitle = input('All done!');

  /** The message displayed on the success screen after submission. */
  readonly successMessage = input('Your request has been successfully submitted.');

  /** Tracks whether the stepper has been successfully submitted. */
  readonly isSubmitted = signal(false);

  constructor() {
    effect(() => {
      this.updateSteps();
    });
  }

  next() {
    if (this.activeStepIndex() < this.steps().length - 1) {
      this.steps()[this.activeStepIndex()].isCompleted.set(true);
      this.activeStepIndex.update(v => v + 1);
      this.updateSteps();
      this.stepChange.emit(this.activeStepIndex());
    }
  }

  previous() {
    if (this.activeStepIndex() > 0) {
      this.activeStepIndex.update(v => v - 1);
      this.updateSteps();
      this.stepChange.emit(this.activeStepIndex());
    }
  }

  submit() {
    const steps = this.steps();
    const activeStepIndex = this.activeStepIndex();
    if (activeStepIndex === steps.length - 1) {
      steps[activeStepIndex].isCompleted.set(true);
      this.isSubmitted.set(true);
      // TODO: The 'emit' function requires a mandatory void argument
      this.stepperSubmit.emit();
    }
  }

  goToStep(index: number) {
    if (this.linear()) {
      // In linear mode, can only go to already completed steps or the next one
      const stepsArray = this.steps();
      const activeStepIndex = this.activeStepIndex();
      if (index <= activeStepIndex || (index === activeStepIndex + 1 && stepsArray[activeStepIndex].isCompleted())) {
        this.activeStepIndex.set(index);
        this.updateSteps();
        this.stepChange.emit(index);
      }
    } else {
      this.activeStepIndex.set(index);
      this.updateSteps();
      this.stepChange.emit(this.activeStepIndex());
    }
  }

  private updateSteps() {
    const steps = this.steps();
    if (steps) {
      steps.forEach((step, index) => {
        step.isActive.set(index === this.activeStepIndex());
        if (index < this.activeStepIndex()) {
          step.isCompleted.set(true);
        }
      });
    }
  }

  getStepIndicatorClass(step: StepComponent, isActive: boolean, last: boolean) {
    return cn(
      'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 mr-3',
      isActive && !(last && step.isCompleted()) && 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30',
      step.isCompleted() && (!isActive || last) && 'bg-green-500 border-green-500 text-white',
      !isActive && !step.isCompleted() && 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
    );
  }

  getStepIconClass(isActive: boolean) {
    return cn(
      'w-5 h-5',
      isActive ? 'stroke-white' : 'stroke-slate-400'
    );
  }

  getStepLabelClass(isActive: boolean) {
    return cn(
      'text-sm font-semibold whitespace-nowrap transition-colors',
      isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
    );
  }

  getStepConnectorClass(step: StepComponent) {
    return cn(
      'h-px w-12 mx-3 rounded-full hidden md:block',
      step.isCompleted() ? 'bg-green-500' : 'bg-slate-100 dark:bg-slate-800'
    );
  }
}
