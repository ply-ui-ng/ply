import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComingSoonComponent } from './coming-soon.component';

describe('ComingSoonComponent', () => {
  let component: ComingSoonComponent;
  let fixture: ComponentFixture<ComingSoonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ComingSoonComponent],
    });
    fixture = TestBed.createComponent(ComingSoonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    fixture.componentRef.setInput('title', 'New Feature');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('New Feature');
  });

  it('should display description', () => {
    fixture.componentRef.setInput('description', 'Coming in v2');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Coming in v2');
  });
});
