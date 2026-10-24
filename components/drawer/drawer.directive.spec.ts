import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DrawerComponent } from './drawer.component';
import { DrawerDirective } from './drawer.directive';

@Component({
  imports: [DrawerDirective, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button id="open" type="button" [ply-drawer]="panel">Open drawer</button>
    <ply-drawer #panel drawerLabel="Filters">
      <p>Choose a filter.</p>
    </ply-drawer>
  `,
})
class DrawerHostComponent {}

describe('DrawerDirective', () => {
  let fixture: ComponentFixture<DrawerHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(DrawerHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function trigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('#open') as HTMLButtonElement;
  }

  it('opens the drawer dialog from the trigger and closes on Escape', async () => {
    const button = trigger();
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    expect(button.getAttribute('aria-expanded')).toBe('false');

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.textContent).toContain('Choose a filter.');

    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    await vi.waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });
});
