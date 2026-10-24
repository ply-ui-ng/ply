import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrollBottomComponent } from './scroll-bottom.component';
import { DirectionRegistry } from '../direction/direction.service';

describe('ScrollBottomComponent', () => {
  let component: ScrollBottomComponent;
  let fixture: ComponentFixture<ScrollBottomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollBottomComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.documentElement.removeAttribute('dir');
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render content', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });

  it('anchors bottom-end to the right in LTR and the left in RTL', () => {
    expect(fixture.nativeElement.className).toContain('right-6');

    TestBed.inject(DirectionRegistry).setDocumentDirection('rtl');
    fixture.detectChanges();

    expect(fixture.nativeElement.className).toContain('left-6');
    expect(fixture.nativeElement.className).not.toContain('right-6');
  });
});
