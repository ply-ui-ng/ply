import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FormWizardComponent } from './form-wizard.component';

describe('FormWizardComponent', () => {
  let component: FormWizardComponent;
  let fixture: ComponentFixture<FormWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormWizardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FormWizardComponent);
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
