import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChipComponent } from './chip.component';

describe('ChipComponent a11y', () => {
  let fixture: ComponentFixture<ChipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChipComponent],
    });
    fixture = TestBed.createComponent(ChipComponent);
    fixture.detectChanges();
  });

  it('exposes button semantics with aria-pressed', () => {
    const chip = fixture.nativeElement.querySelector('[role="button"]') as HTMLElement;
    expect(chip).toBeTruthy();
    expect(chip.getAttribute('aria-pressed')).toBe('false');

    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();
    expect(chip.getAttribute('aria-pressed')).toBe('true');
  });

  it('uses a configurable remove label', () => {
    fixture.componentRef.setInput('removable', true);
    fixture.componentRef.setInput('removeLabel', 'Remove tag');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button[aria-label="Remove tag"]')).toBeTruthy();
  });
});
