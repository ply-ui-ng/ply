import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormFilterComponent } from './form-filter.component';

describe('FormFilterComponent', () => {
  let component: FormFilterComponent;
  let fixture: ComponentFixture<FormFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFilterComponent);
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
