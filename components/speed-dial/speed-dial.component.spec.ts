import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpeedDialComponent } from './speed-dial.component';

describe('SpeedDialComponent', () => {
  let component: SpeedDialComponent;
  let fixture: ComponentFixture<SpeedDialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeedDialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpeedDialComponent);
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
