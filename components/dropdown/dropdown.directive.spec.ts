import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';
import { DropdownMenuItemComponent } from '../dropdown-menu/dropdown-menu-item/dropdown-menu-item.component';
import { DropdownMenuDirective } from './dropdown.directive';
import { BaseDropdownMenuItemDirective } from '../ply-dropdown-menu-item/ply-dropdown-menu-item.directive';

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

@Component({
  imports: [DropdownMenuDirective, DropdownMenuComponent, BaseDropdownMenuItemDirective, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button id="open" type="button" [ply-dropdown-menu-trigger]="menu">Open</button>
    <ply-dropdown-menu #menu>
      <button ply-dropdown-menu-item type="button" routerLink="/blocks">Blocks</button>
    </ply-dropdown-menu>
  `,
})
class DropdownLinkHostComponent {}

describe('Dropdown menu page links', () => {
  let fixture: ComponentFixture<DropdownLinkHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownLinkHostComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownLinkHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  async function openMenu(): Promise<HTMLElement> {
    (fixture.nativeElement.querySelector('#open') as HTMLButtonElement).click();
    fixture.detectChanges();
    await vi.waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeTruthy();
    });
    return document.querySelector('[role="menu"]') as HTMLElement;
  }

  it('closes when a routerLink item is clicked', async () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const menu = await openMenu();
    const item = menu.querySelector('[role="menuitem"]') as HTMLElement;

    item.click();

    expect(document.querySelector('[role="menu"]')).toBeNull();
  });

  it('closes when Enter activates a routerLink item', async () => {
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const menu = await openMenu();
    const item = menu.querySelector('[role="menuitem"]') as HTMLElement;
    item.focus();

    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));

    expect(nav).toHaveBeenCalled();
    expect(document.querySelector('[role="menu"]')).toBeNull();
  });
});
