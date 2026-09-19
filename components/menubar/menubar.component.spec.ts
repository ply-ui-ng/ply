import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenubarComponent } from './menubar.component';
import { MenubarMenuComponent } from './menubar-menu.component';
import { DropdownMenuItemComponent } from '../dropdown-menu/dropdown-menu-item/dropdown-menu-item.component';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';
import { DropdownMenuDirective } from '../dropdown/dropdown.directive';

@Component({
  template: `
    <ply-menubar>
      <ply-menubar-menu label="File">
        <ply-dropdown-menu-item>New Tab</ply-dropdown-menu-item>
        <ply-dropdown-menu-item [ply-dropdown-menu-trigger]="recent" placement="right">
          Open Recent
        </ply-dropdown-menu-item>
        <ply-dropdown-menu #recent>
          <ply-dropdown-menu-item>Project A</ply-dropdown-menu-item>
          <ply-dropdown-menu-item [ply-dropdown-menu-trigger]="more" placement="right">
            More
          </ply-dropdown-menu-item>
          <ply-dropdown-menu #more>
            <ply-dropdown-menu-item>From GitHub</ply-dropdown-menu-item>
          </ply-dropdown-menu>
        </ply-dropdown-menu>
        <ply-dropdown-menu-item [(checked)]="wordWrap">Word wrap</ply-dropdown-menu-item>
        <ply-dropdown-menu-item>Save</ply-dropdown-menu-item>
      </ply-menubar-menu>
      <ply-menubar-menu label="Edit">
        <ply-dropdown-menu-item>Cut</ply-dropdown-menu-item>
      </ply-menubar-menu>
    </ply-menubar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MenubarComponent,
    MenubarMenuComponent,
    DropdownMenuItemComponent,
    DropdownMenuComponent,
    DropdownMenuDirective,
  ],
})
class MenubarHostComponent {
  wordWrap = true;
}

@Component({
  template: `
    <ply-menubar>
      <ply-menubar-menu label="File" disabled>
        <ply-dropdown-menu-item>New Tab</ply-dropdown-menu-item>
      </ply-menubar-menu>
      <ply-menubar-menu label="Edit">
        <ply-dropdown-menu-item>Cut</ply-dropdown-menu-item>
      </ply-menubar-menu>
    </ply-menubar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MenubarComponent, MenubarMenuComponent, DropdownMenuItemComponent],
})
class MenubarDisabledFirstHostComponent {}

describe('MenubarComponent', () => {
  let fixture: ComponentFixture<MenubarHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenubarHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenubarHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('renders a menubar with labeled triggers', () => {
    const bar = fixture.nativeElement.querySelector('[role="menubar"]') as HTMLElement;
    expect(bar).toBeTruthy();
    const items = bar.querySelectorAll('[role="menuitem"]');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('File');
    expect(items[1].textContent).toContain('Edit');
  });

  it('projects menu items into the open dropdown', () => {
    const trigger = fixture.nativeElement.querySelector('[role="menuitem"]') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    expect(document.body.textContent).toContain('New Tab');
  });

  it('does not move top-level focus when Home or End is pressed inside an open menu', () => {
    const triggers = fixture.nativeElement.querySelectorAll(
      'ply-menubar-menu > button[role="menuitem"]',
    ) as NodeListOf<HTMLButtonElement>;
    const fileTrigger = triggers[0];
    fileTrigger.click();
    fixture.detectChanges();

    const panelItem = Array.from(document.querySelectorAll('[role="menuitem"]')).find(
      (el) => el.textContent?.includes('New Tab'),
    ) as HTMLElement | undefined;
    expect(panelItem).toBeTruthy();
    panelItem!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(document.activeElement).not.toBe(triggers[1]);
    expect(fileTrigger.getAttribute('tabindex')).toBe('0');
  });

  it('moves between top-level menus with ArrowRight and ArrowLeft', () => {
    const triggers = fixture.nativeElement.querySelectorAll(
      'ply-menubar-menu > button[role="menuitem"]',
    ) as NodeListOf<HTMLButtonElement>;
    triggers[0].focus();
    triggers[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(triggers[1].getAttribute('tabindex')).toBe('0');
    expect(document.activeElement).toBe(triggers[1]);

    triggers[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(triggers[0].getAttribute('tabindex')).toBe('0');
    expect(document.activeElement).toBe(triggers[0]);
  });

  it('opens the next menu when ArrowRight is pressed while a menu is open', () => {
    const triggers = fixture.nativeElement.querySelectorAll(
      'ply-menubar-menu > button[role="menuitem"]',
    ) as NodeListOf<HTMLButtonElement>;
    triggers[0].click();
    fixture.detectChanges();
    expect(document.body.textContent).toContain('New Tab');

    triggers[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(document.body.textContent).toContain('Cut');
    expect(document.body.textContent).not.toContain('New Tab');
  });

  it('opens a nested submenu on hover after the parent is open', () => {
    const trigger = fixture.nativeElement.querySelector('[role="menuitem"]') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const recent = Array.from(document.querySelectorAll('[role="menuitem"]')).find((el) =>
      el.textContent?.includes('Open Recent'),
    ) as HTMLElement | undefined;
    expect(recent).toBeTruthy();
    recent!.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    fixture.detectChanges();
    expect(document.body.textContent).toContain('Project A');

    const more = Array.from(document.querySelectorAll('[role="menuitem"]')).find((el) =>
      el.textContent?.trim() === 'More',
    ) as HTMLElement | undefined;
    expect(more).toBeTruthy();
    more!.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    fixture.detectChanges();
    expect(document.body.textContent).toContain('From GitHub');
  });

  it('keeps the menu open when a checkbox item is toggled', () => {
    const trigger = fixture.nativeElement.querySelector('[role="menuitem"]') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const wrap = document.querySelector('[role="menuitemcheckbox"]') as HTMLElement | null;
    expect(wrap).toBeTruthy();
    expect(wrap!.getAttribute('aria-checked')).toBe('true');
    wrap!.click();
    fixture.detectChanges();
    expect(document.body.textContent).toContain('Word wrap');
    expect(wrap!.getAttribute('aria-checked')).toBe('false');
  });

  it('closes the menu when a leaf item is clicked', () => {
    const trigger = fixture.nativeElement.querySelector('[role="menuitem"]') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    expect(document.body.textContent).toContain('New Tab');

    const save = Array.from(document.querySelectorAll('[role="menuitem"]')).find((el) =>
      el.textContent?.includes('Save'),
    ) as HTMLElement | undefined;
    expect(save).toBeTruthy();
    save!.click();
    fixture.detectChanges();
    expect(document.body.textContent).not.toContain('New Tab');
  });
});

describe('MenubarComponent disabled first menu', () => {
  let fixture: ComponentFixture<MenubarDisabledFirstHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenubarDisabledFirstHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenubarDisabledFirstHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('gives tabindex 0 to the first enabled menu when the default active menu is disabled', () => {
    const items = fixture.nativeElement.querySelectorAll(
      '[role="menubar"] [role="menuitem"]',
    ) as NodeListOf<HTMLButtonElement>;
    expect(items.length).toBe(2);
    expect(items[0].disabled).toBe(true);
    expect(items[0].getAttribute('tabindex')).toBe('-1');
    expect(items[1].disabled).toBe(false);
    expect(items[1].getAttribute('tabindex')).toBe('0');
  });
});
