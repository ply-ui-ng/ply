import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccordionItemComponent } from './accordion-item.component';

describe('AccordionItemComponent', () => {
  let component: AccordionItemComponent;
  let fixture: ComponentFixture<AccordionItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AccordionItemComponent] });
    fixture = TestBed.createComponent(AccordionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start closed', () => {
    expect(component.isOpen()).toBe(false);
  });

  it('should toggle open on toggle()', () => {
    component.toggle();
    expect(component.isOpen()).toBe(true);
  });

  it('should toggle closed when called twice', () => {
    component.toggle();
    component.toggle();
    expect(component.isOpen()).toBe(false);
  });

  it('should emit toggled event with current open state', () => {
    const emitted: boolean[] = [];
    component.toggled.subscribe((v: boolean) => emitted.push(v));
    component.toggle();
    component.toggle();
    expect(emitted).toEqual([true, false]);
  });

  it('should not toggle when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    component.toggle();
    expect(component.isOpen()).toBe(false);
  });

  it('should not emit when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    let emitted = false;
    component.toggled.subscribe(() => (emitted = true));
    component.toggle();
    expect(emitted).toBe(false);
  });

  it('should include disabled classes when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.className).toContain('cursor-not-allowed');
    expect(el.className).toContain('opacity-50');
  });

  it('uses --ply-ring for header focus', () => {
    expect(component.headerButtonClass()).toContain('--ply-ring');
  });

  it('uses a button header with aria-controls and aria-expanded', () => {
    const button = fixture.nativeElement.querySelector('button[type="button"]') as HTMLButtonElement;
    const panel = fixture.nativeElement.querySelector('[role="region"]') as HTMLElement;

    expect(button.getAttribute('aria-controls')).toBe(component.panelId);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(panel.id).toBe(component.panelId);
    expect(panel.getAttribute('aria-labelledby')).toBe(component.headerId);

    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });
});
