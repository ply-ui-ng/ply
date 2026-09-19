import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AspectRatioComponent } from './aspect-ratio.component';

describe('AspectRatioComponent', () => {
  let fixture: ComponentFixture<AspectRatioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AspectRatioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AspectRatioComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('applies the default 16/9 aspect-ratio', () => {
    const ratio = String(fixture.nativeElement.style.aspectRatio).replace(/\s/g, '');
    expect(ratio).toBe('16/9');
  });
});
