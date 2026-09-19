import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DialogService } from './dialog.service';

@Component({
  template: '',
  standalone: true,
})
class DialogSsrStubComponent {}

describe('DialogService SSR', () => {
  it('open() does not touch document.body on the server', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const service = TestBed.inject(DialogService);
    const append = vi.spyOn(document.body, 'appendChild');
    const result = await firstValueFrom(service.open(DialogSsrStubComponent));
    expect(result).toBeUndefined();
    expect(append).not.toHaveBeenCalled();
  });

  it('confirm() emits false on the server', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const service = TestBed.inject(DialogService);
    const append = vi.spyOn(document.body, 'appendChild');
    const result = await firstValueFrom(service.confirm({ title: 'Delete?' }));
    expect(result).toBe(false);
    expect(append).not.toHaveBeenCalled();
  });
});
