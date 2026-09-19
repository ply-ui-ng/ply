import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormShippingComponent } from './form-shipping.component';

describe('FormShippingComponent', () => {
  let component: FormShippingComponent;
  let fixture: ComponentFixture<FormShippingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormShippingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormShippingComponent);
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
