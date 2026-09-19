import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FormSignupComponent } from './form-signup.component';

describe('FormSignupComponent', () => {
  let component: FormSignupComponent;
  let fixture: ComponentFixture<FormSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSignupComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FormSignupComponent);
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

  it('should emit submitted when the form is submitted', () => {
    const spy = vi.fn();
    component.submitted.subscribe(spy);

    component.firstName = 'Ada';
    component.lastName = 'Lovelace';
    component.email = ' ada@example.com ';
    component.password = 'secret';

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(spy).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'secret',
    });
  });
});
