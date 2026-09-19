import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastItem } from './toast.service';

function makeToast(overrides: Partial<ToastItem> = {}): ToastItem {
  return {
    id: 1,
    message: 'Saved successfully',
    color: 'success',
    icon: 'check',
    duration: 3000,
    position: 'top-right',
    removing: false,
    ...overrides,
  };
}

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion') && matches,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      }) as unknown as MediaQueryList,
  );
}

describe('ToastComponent a11y', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(() => {
    mockReducedMotion(false);
    TestBed.configureTestingModule({
      imports: [ToastComponent],
    });
    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fixture?.destroy();
  });

  it('uses role=status for informational toasts', () => {
    component.addToast(makeToast({ color: 'success' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeTruthy();
  });

  it('uses role=alert for danger and warning toasts', () => {
    component.addToast(makeToast({ color: 'danger', message: 'Something failed' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    expect(component.getToastRole(makeToast({ color: 'warning' }))).toBe('alert');
  });

  it('names the dismiss button with the toast message', () => {
    component.addToast(makeToast({ message: 'Profile updated' }));
    fixture.detectChanges();
    const dismiss = fixture.nativeElement.querySelector(
      'button[aria-label="Dismiss notification: Profile updated"]',
    );
    expect(dismiss).toBeTruthy();
  });

  it('renders an action button and runs onClick', () => {
    const onClick = vi.fn();
    component.addToast(
      makeToast({
        action: { label: 'Undo', onClick },
      }),
    );
    fixture.detectChanges();
    const action = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((btn) => btn.textContent?.trim() === 'Undo');
    expect(action).toBeTruthy();
    action?.click();
    expect(onClick).toHaveBeenCalled();
  });

  it('stacks extra toasts behind the newest and marks overflow inert', () => {
    vi.useFakeTimers();
    component.addToast(makeToast({ id: 1, message: 'One' }));
    component.addToast(makeToast({ id: 2, message: 'Two' }));
    component.addToast(makeToast({ id: 3, message: 'Three' }));
    component.addToast(makeToast({ id: 4, message: 'Four' }));
    vi.advanceTimersByTime(20);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('[data-toast-id]') as NodeListOf<HTMLElement>;
    expect(cards.length).toBe(4);
    expect(cards[3].style.opacity).toBe('1');
    expect(cards[0].style.opacity).toBe('0');
    expect(cards[0].hasAttribute('inert')).toBe(true);
    expect(cards[3].hasAttribute('inert')).toBe(false);
  });

  it('expands the stack on pointer enter', () => {
    vi.useFakeTimers();
    component.addToast(makeToast({ id: 1, message: 'One' }));
    component.addToast(makeToast({ id: 2, message: 'Two' }));
    component.addToast(makeToast({ id: 3, message: 'Three' }));
    component.addToast(makeToast({ id: 4, message: 'Four' }));
    vi.advanceTimersByTime(20);
    fixture.detectChanges();

    const stack = fixture.nativeElement.querySelector('[data-toast-stack]') as HTMLElement;
    stack.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    fixture.detectChanges();

    expect(component.expanded()).toBe(true);
    const cards = fixture.nativeElement.querySelectorAll('[data-toast-id]') as NodeListOf<HTMLElement>;
    expect(cards[0].style.opacity).toBe('1');
    expect(cards[0].hasAttribute('inert')).toBe(false);
  });

  it('pauses auto-dismiss while the stack is hovered', () => {
    vi.useFakeTimers();
    component.addToast(makeToast({ id: 1, duration: 1000 }));
    fixture.detectChanges();
    component.onStackEnter();
    vi.advanceTimersByTime(2000);
    fixture.detectChanges();
    expect(component.toasts().some((t) => t.id === 1 && !t.removing)).toBe(true);

    component.onStackLeave();
    vi.advanceTimersByTime(160);
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(component.toasts().find((t) => t.id === 1)?.removing).toBe(true);
  });

  it('dismisses on a swipe toward the nearest edge', () => {
    component.addToast(makeToast({ id: 1, duration: 0, position: 'top-right' }));
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('[data-toast-id]') as HTMLElement;

    card.dispatchEvent(
      new PointerEvent('pointerdown', { button: 0, clientX: 200, clientY: 40, bubbles: true }),
    );
    card.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 280, clientY: 40, bubbles: true }),
    );
    card.dispatchEvent(
      new PointerEvent('pointerup', { clientX: 280, clientY: 40, bubbles: true }),
    );
    fixture.detectChanges();

    expect(component.toasts().find((t) => t.id === 1)?.removing).toBe(true);
  });
});

describe('ToastComponent reduced motion', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(() => {
    mockReducedMotion(true);
    TestBed.configureTestingModule({
      imports: [ToastComponent],
    });
    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fixture?.destroy();
  });

  it('renders a static list without stacked transforms', () => {
    expect(component.reducedMotion()).toBe(true);
    component.addToast(makeToast({ id: 1, message: 'One' }));
    component.addToast(makeToast({ id: 2, message: 'Two' }));
    fixture.detectChanges();

    const stack = fixture.nativeElement.querySelector('[data-toast-stack]') as HTMLElement;
    expect(stack.className).toContain('flex');
    const cards = fixture.nativeElement.querySelectorAll('[data-toast-id]') as NodeListOf<HTMLElement>;
    expect(cards[0].style.position).not.toBe('absolute');
    expect(cards[0].style.transform).toContain('scale(1)');
  });

  it('does not swipe-dismiss when reduced motion is on', () => {
    component.addToast(makeToast({ id: 1, duration: 0, position: 'top-right' }));
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('[data-toast-id]') as HTMLElement;
    card.dispatchEvent(
      new PointerEvent('pointerdown', { button: 0, clientX: 200, clientY: 40, bubbles: true }),
    );
    card.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 280, clientY: 40, bubbles: true }),
    );
    card.dispatchEvent(
      new PointerEvent('pointerup', { clientX: 280, clientY: 40, bubbles: true }),
    );
    fixture.detectChanges();
    expect(component.toasts().find((t) => t.id === 1)?.removing).toBeFalsy();
  });
});
