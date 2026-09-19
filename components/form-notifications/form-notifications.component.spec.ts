import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormNotificationsComponent } from './form-notifications.component';

describe('FormNotificationsComponent', () => {
  let component: FormNotificationsComponent;
  let fixture: ComponentFixture<FormNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormNotificationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormNotificationsComponent);
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
