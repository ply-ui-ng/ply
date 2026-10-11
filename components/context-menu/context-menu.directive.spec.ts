import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContextMenuComponent } from './context-menu.component';
import { ContextMenuDirective } from './context-menu.directive';
import { BaseContextMenuItemDirective } from '../ply-context-menu-item/ply-context-menu-item.directive';

@Component({
  imports: [ContextMenuDirective, ContextMenuComponent, BaseContextMenuItemDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" [ply-context-menu-trigger]="menu">File actions</button>
    <ply-context-menu #menu>
      <button ply-context-menu-item type="button">Copy</button>
      <button ply-context-menu-item type="button">Delete</button>
    </ply-context-menu>
  `,
})
class ContextMenuHostComponent {}

describe('ContextMenuDirective keyboard', () => {
  let fixture: ComponentFixture<ContextMenuHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenuHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextMenuHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('moves focus with ArrowDown and closes on Escape', async () => {
    const directive = fixture.debugElement.query(By.directive(ContextMenuDirective))
      .injector.get(ContextMenuDirective);
    directive.open({ x: 8, y: 8 });
    fixture.detectChanges();

    await vi.waitFor(() => {
      const items = document.querySelectorAll<HTMLElement>('[role="menuitem"]');
      expect(items.length).toBe(2);
      expect(document.activeElement).toBe(items[0]);
    });

    const menu = document.querySelector('[role="menu"]') as HTMLElement;
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    const items = document.querySelectorAll<HTMLElement>('[role="menuitem"]');
    expect(document.activeElement).toBe(items[1]);

    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.querySelector('[role="menu"]')).toBeNull();
  });
});
