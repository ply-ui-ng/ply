import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FormLoginTabsComponent } from './form-login-tabs.component';

describe('FormLoginTabsComponent', () => {
  let component: FormLoginTabsComponent;
  let fixture: ComponentFixture<FormLoginTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormLoginTabsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FormLoginTabsComponent);
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
