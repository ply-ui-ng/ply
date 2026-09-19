import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CardComponent] });
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply base host classes', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.className).toContain('bg-white');
    expect(el.className).toContain('rounded-xl');
    expect(el.className).toContain('overflow-hidden');
  });

  it('should merge consumer class with cn()', () => {
    fixture.componentRef.setInput('class', 'shadow-xl');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.className).toContain('shadow-xl');
    expect(el.className).toContain('bg-white');
  });

  it('should default horizontal to false', () => {
    expect(component.horizontal()).toBe(false);
  });

  it('should accept horizontal input', () => {
    fixture.componentRef.setInput('horizontal', true);
    fixture.detectChanges();
    expect(component.horizontal()).toBe(true);
  });
});
