import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FormSignupTabsComponent } from './form-signup-tabs.component';

describe('FormSignupTabsComponent', () => {
  let component: FormSignupTabsComponent;
  let fixture: ComponentFixture<FormSignupTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSignupTabsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FormSignupTabsComponent);
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
