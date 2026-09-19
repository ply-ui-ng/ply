import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidenavComponent } from './sidenav.component';

describe('SidenavComponent', () => {
  let component: SidenavComponent;
  let fixture: ComponentFixture<SidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidenavComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidenavComponent);
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

  it('should scroll an off-screen active nav item to the top of the rail', async () => {
    const host = fixture.nativeElement as HTMLElement;
    const rail = host.querySelector('[tabindex="0"]') as HTMLElement;
    Object.defineProperty(rail, 'scrollHeight', { configurable: true, value: 2000 });
    Object.defineProperty(rail, 'clientHeight', { configurable: true, value: 400 });
    rail.style.overflowY = 'auto';

    const nav = document.createElement('ply-sidenav-nav');
    const active = document.createElement('button');
    active.className = '!text-blue-600';
    active.textContent = 'Slider';
    nav.appendChild(active);
    rail.appendChild(nav);

    const scrollTo = vi.fn();
    rail.scrollTo = scrollTo as typeof rail.scrollTo;
    vi.spyOn(rail, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 400,
      left: 0,
      right: 240,
      width: 240,
      height: 400,
      x: 0,
      y: 0,
      toJSON: () => undefined,
    });
    vi.spyOn(active, 'getBoundingClientRect').mockReturnValue({
      top: 1200,
      bottom: 1236,
      left: 0,
      right: 240,
      width: 240,
      height: 36,
      x: 0,
      y: 1200,
      toJSON: () => undefined,
    });

    component.updateSelectedLabel();
    await vi.waitFor(() => {
      expect(scrollTo).toHaveBeenCalled();
    });
    expect(scrollTo.mock.calls[0][0]).toEqual(
      expect.objectContaining({ top: expect.any(Number), behavior: 'smooth' }),
    );
    expect((scrollTo.mock.calls[0][0] as ScrollToOptions).top).toBeGreaterThanOrEqual(0);
  });
});
