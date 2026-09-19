import { ApplicationRef, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService SSR', () => {
  it('show() returns 0 and does not append a live region on the server', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const service = TestBed.inject(ToastService);
    const append = vi.spyOn(document.body, 'appendChild');
    expect(service.show('Hello')).toBe(0);
    expect(append).not.toHaveBeenCalled();
  });
});

describe('ToastService browser', () => {
  afterEach(() => {
    document.querySelectorAll('[aria-live="polite"]').forEach((el) => el.remove());
    TestBed.resetTestingModule();
  });

  it('show() mounts a live region and dismiss() removes the toast after the exit', () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ToastService);
    const appRef = TestBed.inject(ApplicationRef);
    const id = service.show('Hello', { duration: 0 });
    appRef.tick();
    expect(id).toBeGreaterThan(0);
    expect(document.querySelector('[data-toast-id]')).toBeTruthy();

    service.dismiss(id);
    vi.advanceTimersByTime(400);
    appRef.tick();
    expect(document.querySelector('[data-toast-id]')).toBeFalsy();
    vi.useRealTimers();
  });
});
