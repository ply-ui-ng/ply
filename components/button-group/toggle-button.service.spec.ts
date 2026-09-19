import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ToggleButtonService } from './toggle-button.service';

describe('ToggleButtonService', () => {
  let service: ToggleButtonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToggleButtonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit selected button', async () => {
    const button = { active: signal(false), value: () => 'grid' };
    const promise = new Promise<typeof button>((resolve) => {
      service.selectButton$.subscribe((emitted) => resolve(emitted as typeof button));
    });
    service.setSelectedButton(button);
    await expect(promise).resolves.toBe(button);
  });
});
