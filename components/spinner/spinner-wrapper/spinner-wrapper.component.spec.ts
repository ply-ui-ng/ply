import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerWrapperComponent } from './spinner-wrapper.component';

describe('SpinnerWrapperComponent', () => {
  let component: SpinnerWrapperComponent;
  let fixture: ComponentFixture<SpinnerWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerWrapperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerWrapperComponent);
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
