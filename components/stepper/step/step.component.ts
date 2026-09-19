import { Component, TemplateRef, input, viewChild ,
  ChangeDetectionStrategy, booleanAttribute, signal } from '@angular/core';


/**
 * An individual step within a `ply-stepper`.
 * Contains the label, icon, and template content to render when active.
 *
 * @example
 * <ply-step label="Shipping" icon="truck" description="Enter address">
 *   <div>Shipping form content</div>
 * </ply-step>
 */
@Component({
  selector: 'ply-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './step.component.html'
})
export class StepComponent {
  /** The primary title text for this step. */
  readonly label = input('');
  
  /** Optional SVG icon name to display instead of a number. */
  readonly icon = input('');
  
  /** Optional secondary subtitle text for this step. */
  readonly description = input('');
  
  /** If false, prevents advancing past this step if the stepper uses internal navigation. */
  readonly isValid = input(true, { transform: booleanAttribute });

  readonly content = viewChild.required<TemplateRef<unknown>>('content');

  
  /** Whether this step is the currently active one (managed by `ply-stepper`). */
  readonly isActive = signal(false);

  /** Whether this step has been completed (managed by `ply-stepper`). */
  readonly isCompleted = signal(false);
}
