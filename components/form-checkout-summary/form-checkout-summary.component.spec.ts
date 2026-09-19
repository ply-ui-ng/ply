import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FormCheckoutSummaryComponent } from './form-checkout-summary.component';

describe('FormCheckoutSummaryComponent', () => {
  let component: FormCheckoutSummaryComponent;
  let fixture: ComponentFixture<FormCheckoutSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCheckoutSummaryComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FormCheckoutSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render content', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });
});
