import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CollapsibleComponent } from './collapsible.component';
import { CollapsibleTriggerDirective } from './collapsible-trigger.directive';
import { CollapsibleContentComponent } from './collapsible-content.component';

@Component({
  template: `
    <ply-collapsible>
      <button ply-collapsible-trigger>Details</button>
      <ply-collapsible-content>Hidden copy</ply-collapsible-content>
    </ply-collapsible>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CollapsibleComponent, CollapsibleTriggerDirective, CollapsibleContentComponent],
})
class CollapsibleHostComponent {}

describe('CollapsibleComponent a11y', () => {
  let fixture: ComponentFixture<CollapsibleHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CollapsibleHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(CollapsibleHostComponent);
    fixture.detectChanges();
  });

  it('starts collapsed and expands from the trigger', () => {
    const trigger = fixture.nativeElement.querySelector('[ply-collapsible-trigger]') as HTMLButtonElement;
    const region = fixture.nativeElement.querySelector('[role="region"]') as HTMLElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe(region.id);

    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });
});
