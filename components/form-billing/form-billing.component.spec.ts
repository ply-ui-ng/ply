import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBillingComponent } from './form-billing.component';

describe('FormBillingComponent', () => {
  let component: FormBillingComponent;
  let fixture: ComponentFixture<FormBillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormBillingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormBillingComponent);
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
