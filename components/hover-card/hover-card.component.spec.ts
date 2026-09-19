import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HoverCardComponent } from './hover-card.component';

@Component({
  template: `
    <ply-hover-card>
      <button hover-card-trigger type="button">Ada Lovelace</button>
      <p>Mathematician and first programmer.</p>
    </ply-hover-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HoverCardComponent],
})
class HoverCardHostComponent {}

describe('HoverCardComponent', () => {
  let fixture: ComponentFixture<HoverCardHostComponent>;
  let card: HoverCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoverCardHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HoverCardHostComponent);
    fixture.detectChanges();
    card = fixture.debugElement.children[0].componentInstance as HoverCardComponent;
  });

  afterEach(() => fixture?.destroy());

  it('exposes expanded state and controls on the trigger wrapper', () => {
    const trigger = fixture.nativeElement.querySelector('[hover-card-trigger]')
      ?.parentElement as HTMLElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe(card.panelId);

    card.open();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById(card.panelId)).toBeTruthy();
  });

  it('closes on Escape while open', () => {
    card.open();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(card.isOpen()).toBe(false);
  });

  it('stays open when the trigger blurs from a click on non-focusable panel content', () => {
    card.open();
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[hover-card-trigger]')
      ?.parentElement as HTMLElement;
    trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    expect(card.isOpen()).toBe(true);
  });

  it('stays open when focus moves from the trigger into the panel', () => {
    card.open();
    fixture.detectChanges();
    const panel = document.getElementById(card.panelId);
    expect(panel).toBeTruthy();
    const trigger = fixture.nativeElement.querySelector('[hover-card-trigger]')
      ?.parentElement as HTMLElement;
    trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: panel }));
    expect(card.isOpen()).toBe(true);
  });
});
