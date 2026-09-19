import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToggleComponent } from './toggle.component';

describe('ToggleComponent a11y', () => {
  let fixture: ComponentFixture<ToggleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToggleComponent],
    });
    fixture = TestBed.createComponent(ToggleComponent);
    fixture.componentRef.setInput('ariaLabel', 'Enable notifications');
    fixture.detectChanges();
  });

  it('renders the native input as a switch', () => {
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.getAttribute('role')).toBe('switch');
    expect(input.getAttribute('aria-label')).toBe('Enable notifications');
  });
});
