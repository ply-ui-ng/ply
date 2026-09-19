import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TriStateCheckboxComponent } from './tri-state-checkbox.component';

describe('TriStateCheckboxComponent', () => {
  let component: TriStateCheckboxComponent;
  let fixture: ComponentFixture<TriStateCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriStateCheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TriStateCheckboxComponent);
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
