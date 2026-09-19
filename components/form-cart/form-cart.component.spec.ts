import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormCartComponent } from './form-cart.component';

describe('FormCartComponent', () => {
  let component: FormCartComponent;
  let fixture: ComponentFixture<FormCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormCartComponent);
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
