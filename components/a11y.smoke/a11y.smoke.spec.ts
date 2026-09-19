import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expectNoA11yViolations } from '../testing/a11y';
import { AlertComponent } from '../alert/alert.component';
import { BadgeComponent } from '../badge/badge.component';
import { CardComponent } from '../card/card.component';
import { CardBodyComponent } from '../card/card-body/card-body.component';
import { CardHeaderComponent } from '../card/card-header/card-header.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { ProgressComponent } from '../progress/progress.component';
import { QuoteComponent } from '../quote/quote.component';
import { ToggleComponent } from '../toggle/toggle.component';
import { BaseButtonDirective } from '../button/ply-button.directive';
import { StrokedButtonDirective } from '../button/ply-stroked-button.directive';
import { IconComponent } from '../icon/icon.component';
import { KbdComponent } from '../kbd/kbd.component';

/**
 * Host that mounts representative free primitives for axe-core WCAG checks.
 * Kept free-tier only so CI always runs without a Pro license.
 */
@Component({
  standalone: true,
  imports: [
    AlertComponent,
    BadgeComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    CheckboxComponent,
    ProgressComponent,
    QuoteComponent,
    ToggleComponent,
    BaseButtonDirective,
    StrokedButtonDirective,
    IconComponent,
    KbdComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="en">
      <h1>Ply a11y smoke</h1>

      <section aria-labelledby="buttons-heading">
        <h2 id="buttons-heading">Buttons</h2>
        <button type="button" ply-button color="primary">Save</button>
        <button type="button" ply-stroked-button color="default">Cancel</button>
      </section>

      <section aria-labelledby="alert-heading">
        <h2 id="alert-heading">Alert</h2>
        <ply-alert color="primary" variant="soft" icon="info-circle">
          Operation completed successfully.
        </ply-alert>
      </section>

      <section aria-labelledby="card-heading">
        <h2 id="card-heading">Card</h2>
        <ply-card>
          <ply-card-header>Account</ply-card-header>
          <ply-card-body>
            <p>Review your plan and billing details.</p>
          </ply-card-body>
        </ply-card>
      </section>

      <section aria-labelledby="form-heading">
        <h2 id="form-heading">Form controls</h2>
        <ply-checkbox>Email me product updates</ply-checkbox>
        <ply-toggle [ariaLabel]="'Enable notifications'"></ply-toggle>
      </section>

      <section aria-labelledby="feedback-heading">
        <h2 id="feedback-heading">Feedback</h2>
        <ply-badge color="success">Active</ply-badge>
        <ply-progress [value]="40" aria-label="Upload progress"></ply-progress>
        <ply-quote authorName="Ada Lovelace">
          The Analytical Engine weaves algebraic patterns.
        </ply-quote>
        <ply-icon name="home" class="h-5 w-5 stroke-slate-700" aria-hidden="true"></ply-icon>
        <p>Press <ply-kbd>⌘</ply-kbd> <ply-kbd>K</ply-kbd> to search.</p>
      </section>
    </div>
  `,
})
class A11ySmokeHostComponent {}

describe('a11y smoke (axe-core)', () => {
  let fixture: ComponentFixture<A11ySmokeHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [A11ySmokeHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(A11ySmokeHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('has no WCAG 2.x A/AA violations on core free primitives', async () => {
    await expectNoA11yViolations(fixture.nativeElement);
  });
});
