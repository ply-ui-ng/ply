import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';
import { DropdownMenuItemComponent } from '../dropdown-menu/dropdown-menu-item/dropdown-menu-item.component';
import { DropdownMenuDirective } from './dropdown.directive';

@Component({
  imports: [DropdownMenuDirective, DropdownMenuComponent, DropdownMenuItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button id="open" type="button" [ply-dropdown-menu-trigger]="menu">Open</button>
    <ply-dropdown-menu #menu>
      <ply-dropdown-menu-item>Copy</ply-dropdown-menu-item>
    </ply-dropdown-menu>
  `,
})
class DropdownHostComponent {}

describe('DropdownMenuDirective', () => {
  let fixture: ComponentFixture<DropdownHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function trigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('#open') as HTMLButtonElement;
  }

  it('opens the menu from the trigger and closes on Escape', () => {
    const button = trigger();
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    const menu = document.querySelector('[role="menu"]') as HTMLElement;
    expect(menu).toBeTruthy();
    expect(menu.textContent).toContain('Copy');

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });
});
