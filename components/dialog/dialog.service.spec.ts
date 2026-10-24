import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { firstValueFrom } from 'rxjs';
import { DialogService } from './dialog.service';
import { DirectionRegistry } from '../direction/direction.service';

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

describe('DialogService direction', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('dir');
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
    TestBed.resetTestingModule();
  });

  it('opens the overlay in the document direction', () => {
    TestBed.configureTestingModule({
      providers: [provideNoopAnimations()],
    });
    TestBed.inject(DirectionRegistry).setDocumentDirection('rtl');
    const service = TestBed.inject(DialogService);
    service.open(DialogSsrStubComponent).subscribe();

    const pane = document.querySelector('.cdk-overlay-pane') as HTMLElement | null;
    expect(pane).toBeTruthy();
    const dir = pane?.getAttribute('dir') ?? pane?.closest('[dir]')?.getAttribute('dir');
    expect(dir).toBe('rtl');
  });
});
