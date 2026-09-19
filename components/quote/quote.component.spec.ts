import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuoteComponent } from './quote.component';

describe('QuoteComponent', () => {
  let component: QuoteComponent;
  let fixture: ComponentFixture<QuoteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QuoteComponent],
    });
    fixture = TestBed.createComponent(QuoteComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display author name', () => {
    fixture.componentRef.setInput('authorName', 'John Doe');
    fixture.componentRef.setInput('authorRole', 'CEO');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('John Doe');
  });

  it('should display author role', () => {
    fixture.componentRef.setInput('authorName', 'Jane');
    fixture.componentRef.setInput('authorRole', 'CEO');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('CEO');
  });

  it('should default to border-left variant', () => {
    fixture.detectChanges();
    expect(component.variant()).toBe('default');
  });
});
