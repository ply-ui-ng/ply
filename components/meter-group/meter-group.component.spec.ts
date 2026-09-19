import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeterGroupComponent } from './meter-group.component';

describe('MeterGroupComponent', () => {
  let component: MeterGroupComponent;
  let fixture: ComponentFixture<MeterGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeterGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MeterGroupComponent);
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
