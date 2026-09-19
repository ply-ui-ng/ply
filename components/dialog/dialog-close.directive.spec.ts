import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DialogCloseDirective } from './dialog-close.directive';
import { provideBaseUiI18n } from '../i18n/i18n';

@Component({
  template: `<button type="button" ply-dialog-close></button>`,
  imports: [DialogCloseDirective],
})
class CloseHostComponent {}

@Component({
  template: `<button type="button" ply-dialog-close [ariaLabel]="'Dismiss'"></button>`,
  imports: [DialogCloseDirective],
})
class LabeledCloseHostComponent {}

describe('DialogCloseDirective', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('falls back to i18n.close for icon-only buttons', () => {
    TestBed.configureTestingModule({
      imports: [CloseHostComponent],
      providers: [provideBaseUiI18n({ close: 'Fermer' })],
    });
    const fixture = TestBed.createComponent(CloseHostComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Fermer');
  });

  it('lets ariaLabel override the dictionary', () => {
    TestBed.configureTestingModule({
      imports: [LabeledCloseHostComponent],
      providers: [provideBaseUiI18n({ close: 'Fermer' })],
    });
    const fixture = TestBed.createComponent(LabeledCloseHostComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Dismiss');
  });
});
