import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    });
    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display title when provided', () => {
    fixture.componentRef.setInput('title', 'No Items');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No Items');
  });

  it('should display description when provided', () => {
    fixture.componentRef.setInput('description', 'Nothing to show here');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nothing to show here');
  });
});
