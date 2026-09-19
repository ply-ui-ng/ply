import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimatedCounterComponent } from './animated-counter.component';

describe('AnimatedCounterComponent', () => {
  let component: AnimatedCounterComponent;
  let fixture: ComponentFixture<AnimatedCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedCounterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimatedCounterComponent);
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
