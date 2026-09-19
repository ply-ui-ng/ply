import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavListComponent } from './nav-list.component';

describe('NavListComponent a11y', () => {
  let fixture: ComponentFixture<NavListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NavListComponent],
    });
    fixture = TestBed.createComponent(NavListComponent);
    fixture.detectChanges();
  });

  it('renders as a navigation landmark with a default label', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('navigation');
    expect(host.getAttribute('aria-label')).toBe('Navigation');
  });

  it('accepts a custom aria-label', () => {
    fixture.componentRef.setInput('ariaLabel', 'Sidebar menu');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-label')).toBe('Sidebar menu');
  });
});
