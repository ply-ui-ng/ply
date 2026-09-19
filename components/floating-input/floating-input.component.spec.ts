import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloatingInputComponent } from './floating-input.component';

describe('FloatingInputComponent', () => {
  let component: FloatingInputComponent;
  let fixture: ComponentFixture<FloatingInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingInputComponent);
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
