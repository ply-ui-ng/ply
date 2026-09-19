import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingOverlayComponent } from './loading-overlay.component';

describe('LoadingOverlayComponent', () => {
  let fixture: ComponentFixture<LoadingOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingOverlayComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sets aria-busy and shows a status region when visible', () => {
    expect(fixture.nativeElement.getAttribute('aria-busy')).toBeNull();
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('message', 'Saving…');
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('aria-busy')).toBe('true');
    const status = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    expect(status).toBeTruthy();
    expect(status.textContent).toContain('Saving…');
  });
});
