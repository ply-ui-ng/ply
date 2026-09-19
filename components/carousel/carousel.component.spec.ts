import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HorizontalCarouselComponent } from './carousel.component';

describe('HorizontalCarouselComponent', () => {
  let component: HorizontalCarouselComponent;
  let fixture: ComponentFixture<HorizontalCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalCarouselComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HorizontalCarouselComponent);
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

  it('should block pointer events on disabled nav buttons', () => {
    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('button[ply-icon-button]');
    expect(buttons.length).toBe(2);
    for (const btn of buttons) {
      expect(btn.className).toContain('disabled:pointer-events-none');
    }
  });
});
