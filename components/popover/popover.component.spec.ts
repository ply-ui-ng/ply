import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopoverComponent } from './popover.component';

@Component({
  template: `
    <ply-popover>
      <button popover-trigger type="button">Open</button>
      <p>Panel content</p>
    </ply-popover>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PopoverComponent],
})
class PopoverHostComponent {}

describe('PopoverComponent a11y', () => {
  let fixture: ComponentFixture<PopoverHostComponent>;
  let popover: PopoverComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopoverHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PopoverHostComponent);
    fixture.detectChanges();
    popover = fixture.debugElement.children[0].componentInstance as PopoverComponent;
  });

  it('exposes expanded state and controls on the trigger', () => {
    const trigger = fixture.nativeElement.querySelector('[popover-trigger]')?.parentElement as HTMLElement;
    expect(trigger.getAttribute('aria-haspopup')).toBe('true');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe(popover.panelId);

    popover.open();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById(popover.panelId)).toBeTruthy();
  });

  it('closes on Escape while open', () => {
    popover.open();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(popover.isOpen()).toBe(false);
  });
});
