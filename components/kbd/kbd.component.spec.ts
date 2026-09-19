import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbdComponent } from './kbd.component';

describe('KbdComponent', () => {
  let fixture: ComponentFixture<KbdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KbdComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KbdComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a native kbd glyph', () => {
    expect(fixture.nativeElement.querySelector('kbd')).toBeTruthy();
  });
});
