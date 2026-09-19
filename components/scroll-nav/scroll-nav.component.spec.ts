import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrollNavComponent } from './scroll-nav.component';

describe('ScrollNavComponent', () => {
  let component: ScrollNavComponent;
  let fixture: ComponentFixture<ScrollNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollNavComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollNavComponent);
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
