import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgTemplateOutlet } from '@angular/common';
import { DropdownMenuComponent } from './dropdown-menu.component';

@Component({
  template: `
    <ply-dropdown-menu #menu>
      <button role="menuitem" tabindex="-1" type="button">Alpha</button>
      <button role="menuitem" tabindex="-1" type="button">Beta</button>
      <button role="menuitem" tabindex="-1" type="button">Gamma</button>
    </ply-dropdown-menu>
    <ng-container *ngTemplateOutlet="menu.templateRef()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DropdownMenuComponent, NgTemplateOutlet],
})
class DropdownMenuHostComponent {}

describe('DropdownMenuComponent a11y', () => {
  let fixture: ComponentFixture<DropdownMenuHostComponent>;
  let menu: DropdownMenuComponent<unknown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownMenuHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownMenuHostComponent);
    fixture.detectChanges();
    menu = fixture.debugElement.children[0].componentInstance as DropdownMenuComponent<unknown>;
  });

  it('renders a menu container with a stable id', () => {
    const root = document.querySelector('[role="menu"]') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.id).toBe(menu.menuId);
    expect(root.getAttribute('tabindex')).toBe('-1');
  });

  it('emits closed on Escape', () => {
    const emit = vi.fn();
    menu.closed.subscribe(emit);
    menu.onMenuKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(emit).toHaveBeenCalled();
  });

  it('moves focus with arrow keys', () => {
    const root = document.querySelector('[role="menu"]') as HTMLElement;
    const items = root.querySelectorAll('[role="menuitem"]');
    (items[0] as HTMLElement).focus();

    menu.onMenuKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(document.activeElement).toBe(items[1]);

    menu.onMenuKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(document.activeElement).toBe(items[0]);
  });

  it('moves focus with Home and End', () => {
    const root = document.querySelector('[role="menu"]') as HTMLElement;
    const items = root.querySelectorAll('[role="menuitem"]');
    (items[0] as HTMLElement).focus();

    menu.onMenuKeydown(new KeyboardEvent('keydown', { key: 'End' }));
    expect(document.activeElement).toBe(items[2]);

    menu.onMenuKeydown(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(document.activeElement).toBe(items[0]);
  });

  it('typeahead focuses the item starting with that letter', () => {
    const root = document.querySelector('[role="menu"]') as HTMLElement;
    const items = root.querySelectorAll('[role="menuitem"]');
    (items[0] as HTMLElement).focus();

    menu.onMenuKeydown(new KeyboardEvent('keydown', { key: 'g' }));
    expect(document.activeElement).toBe(items[2]);
  });
});
