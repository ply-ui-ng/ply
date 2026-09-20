import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OverlayModule } from '@angular/cdk/overlay';
import { TooltipDirective } from './tooltip.directive';

@Component({
  template: `<button type="button" ply-tooltip="Hint">Hover</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, OverlayModule],
})
class TooltipHostComponent {}

describe('TooltipDirective overlay', () => {
  let fixture: ComponentFixture<TooltipHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TooltipHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(TooltipHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('attaches a CDK overlay pane with role=tooltip', async () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    fixture.debugElement.query(By.directive(TooltipDirective)).triggerEventHandler('mouseenter', {});
    await new Promise((resolve) => setTimeout(resolve, 10));
    fixture.detectChanges();

    const tooltip = document.querySelector('.cdk-overlay-pane [role="tooltip"]');
    expect(tooltip).toBeTruthy();
    expect(tooltip?.textContent).toContain('Hint');
    expect(button.getAttribute('aria-describedby')).toBeTruthy();
  });
});
