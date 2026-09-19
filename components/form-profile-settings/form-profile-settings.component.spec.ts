import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormProfileSettingsComponent } from './form-profile-settings.component';

describe('FormProfileSettingsComponent', () => {
  let component: FormProfileSettingsComponent;
  let fixture: ComponentFixture<FormProfileSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormProfileSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormProfileSettingsComponent);
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
