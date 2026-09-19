import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrollAreaComponent } from './scroll-area.component';

describe('ScrollAreaComponent', () => {
  let fixture: ComponentFixture<ScrollAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollAreaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollAreaComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render content', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });
});
