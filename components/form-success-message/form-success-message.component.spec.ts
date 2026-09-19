import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormSuccessMessageComponent } from './form-success-message.component';

describe('FormSuccessMessageComponent', () => {
  let component: FormSuccessMessageComponent;
  let fixture: ComponentFixture<FormSuccessMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSuccessMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormSuccessMessageComponent);
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
