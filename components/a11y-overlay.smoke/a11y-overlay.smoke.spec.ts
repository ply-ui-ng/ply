import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgTemplateOutlet } from '@angular/common';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FocusTrapFactory } from '@angular/cdk/a11y';
import { expectNoA11yViolations } from '../testing/a11y';
import { ComboboxComponent } from '../combobox/combobox.component';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';
import { MenubarComponent } from '../menubar/menubar.component';
import { MenubarMenuComponent } from '../menubar/menubar-menu.component';
import { DropdownMenuItemComponent } from '../dropdown-menu/dropdown-menu-item/dropdown-menu-item.component';
import { DialogComponent } from '../dialog/dialog/dialog.component';
import { DialogHeaderComponent } from '../dialog/dialog-header/dialog-header.component';
import { DialogBodyComponent } from '../dialog/dialog-body/dialog-body.component';
import { DialogCloseDirective } from '../dialog/dialog-close.directive';
import { DialogService } from '../dialog/dialog.service';
import { CustomSelectComponent } from '../custom-select/custom-select.component';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { ContextMenuDirective } from '../context-menu/context-menu.directive';
import { BaseContextMenuItemDirective } from '../ply-context-menu-item/ply-context-menu-item.directive';
import { PopoverComponent } from '../popover/popover.component';
import { HoverCardComponent } from '../hover-card/hover-card.component';
import { DrawerComponent } from '../drawer/drawer.component';
import { DrawerDirective } from '../drawer/drawer.directive';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';

/**
 * Axe-core against **open** free overlays. Companion to a11y.smoke.spec.ts
 * (closed primitives) so CI catches missing names / roles once a panel is shown.
 */
@Component({
  standalone: true,
  imports: [ComboboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="en">
      <h1>Open combobox</h1>
      <ply-combobox label="Fruit" [options]="options"></ply-combobox>
    </div>
  `,
})
class OpenComboboxHostComponent {
  readonly options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
  ];
}

@Component({
  standalone: true,
  imports: [DropdownMenuComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="en">
      <h1>Open menu</h1>
      <ply-dropdown-menu #menu>
        <button role="menuitem" tabindex="-1" type="button">Copy</button>
        <button role="menuitem" tabindex="-1" type="button">Paste</button>
      </ply-dropdown-menu>
      <ng-container *ngTemplateOutlet="menu.templateRef()" />
    </div>
  `,
})
class OpenDropdownHostComponent {}

@Component({
  standalone: true,
  imports: [MenubarComponent, MenubarMenuComponent, DropdownMenuItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="en">
      <h1>Open menubar</h1>
      <ply-menubar>
        <ply-menubar-menu label="File">
          <ply-dropdown-menu-item>New Tab</ply-dropdown-menu-item>
          <ply-dropdown-menu-item>Save</ply-dropdown-menu-item>
        </ply-menubar-menu>
        <ply-menubar-menu label="Edit">
          <ply-dropdown-menu-item>Cut</ply-dropdown-menu-item>
        </ply-menubar-menu>
      </ply-menubar>
    </div>
  `,
})
class OpenMenubarHostComponent {}

@Component({
  standalone: true,
  imports: [DialogComponent, DialogHeaderComponent, DialogBodyComponent, DialogCloseDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ply-dialog>
      <ply-dialog-header>
        <h2>Confirm delete</h2>
        <button type="button" ply-dialog-close></button>
      </ply-dialog-header>
      <ply-dialog-body>
        <p>This cannot be undone.</p>
      </ply-dialog-body>
    </ply-dialog>
  `,
})
class OverlayA11yDialogComponent {}

@Component({
  standalone: true,
  imports: [CustomSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="en">
      <h1>Open select</h1>
      <ply-custom-select label="Fruit" [options]="options"></ply-custom-select>
    </div>
  `,
})
class OpenCustomSelectHostComponent {
  readonly options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
  ];
}

@Component({
  standalone: true,
  imports: [ContextMenuDirective, ContextMenuComponent, BaseContextMenuItemDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="en">
      <h1>Open context menu</h1>
      <button type="button" [ply-context-menu-trigger]="menu">File actions</button>
      <ply-context-menu #menu>
        <button ply-context-menu-item type="button">Copy</button>
        <button ply-context-menu-item type="button">Delete</button>
      </ply-context-menu>
    </div>
  `,
})
class OpenContextMenuHostComponent {}

@Component({
  standalone: true,
  imports: [PopoverComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="en">
      <h1>Open popover</h1>
      <ply-popover label="Account">
        <button popover-trigger type="button">Account</button>
        <p>Signed in as Ada.</p>
      </ply-popover>
    </div>
  `,
})
class OpenPopoverHostComponent {}

@Component({
  standalone: true,
  imports: [HoverCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="en">
      <h1>Open hover card</h1>
      <ply-hover-card label="Ada Lovelace">
        <button hover-card-trigger type="button">Ada Lovelace</button>
        <p>Mathematician and first programmer.</p>
      </ply-hover-card>
    </div>
  `,
})
class OpenHoverCardHostComponent {}

@Component({
  standalone: true,
  imports: [DrawerDirective, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="en">
      <h1>Open drawer</h1>
      <button type="button" [ply-drawer]="panel">Open drawer</button>
      <ply-drawer #panel drawerLabel="Filters">
        <p>Choose a filter.</p>
      </ply-drawer>
    </div>
  `,
})
class OpenDrawerHostComponent {}

@Component({
  standalone: true,
  imports: [BottomSheetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="en">
      <h1>Open bottom sheet</h1>
      <ply-bottom-sheet [open]="true" sheetLabel="Share">
        <p>Share this page.</p>
      </ply-bottom-sheet>
    </div>
  `,
})
class OpenBottomSheetHostComponent {}

function removeFloatingUi(): void {
  document.querySelectorAll('.cdk-overlay-container, ply-dialog-container').forEach((el) => el.remove());
}

describe('a11y smoke — open overlays (axe-core)', () => {
  let fixture: ComponentFixture<unknown> | undefined;

  afterEach(() => {
    const backdrop = document.querySelector(
      'ply-dialog-container [role="presentation"]',
    ) as HTMLElement | null;
    backdrop?.click();
    fixture?.destroy();
    fixture = undefined;
    removeFloatingUi();
    TestBed.resetTestingModule();
  });

  it('has no WCAG 2.x A/AA violations on an open combobox listbox', async () => {
    await TestBed.configureTestingModule({ imports: [OpenComboboxHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(OpenComboboxHostComponent);
    fixture.detectChanges();
    const combobox = fixture.debugElement.query(By.directive(ComboboxComponent))
      .componentInstance as ComboboxComponent;
    combobox.openDropdown();
    fixture.detectChanges();
    const pane = document.querySelector('.cdk-overlay-pane');
    expect(pane).toBeTruthy();
    await expectNoA11yViolations(fixture.nativeElement);
    await expectNoA11yViolations(pane!);
  });

  it('has no WCAG 2.x A/AA violations on an open dropdown menu', async () => {
    await TestBed.configureTestingModule({ imports: [OpenDropdownHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(OpenDropdownHostComponent);
    fixture.detectChanges();
    expect(document.querySelector('[role="menu"]')).toBeTruthy();
    await expectNoA11yViolations(fixture.nativeElement);
  });

  it('has no WCAG 2.x A/AA violations on an open menubar panel', async () => {
    await TestBed.configureTestingModule({ imports: [OpenMenubarHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(OpenMenubarHostComponent);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[role="menuitem"]') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    const pane = document.querySelector('.cdk-overlay-pane');
    expect(pane).toBeTruthy();
    expect(pane!.textContent).toContain('New Tab');
    await expectNoA11yViolations(fixture.nativeElement);
    await expectNoA11yViolations(pane!);
  });

  it('has no WCAG 2.x A/AA violations on an open dialog', async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayA11yDialogComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: FocusTrapFactory,
          useValue: {
            create: () => ({
              focusInitialElementWhenReady: () => undefined,
              destroy: () => undefined,
            }),
          },
        },
      ],
    }).compileComponents();

    const dialogs = TestBed.inject(DialogService);
    dialogs.open(OverlayA11yDialogComponent);
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog).toBeTruthy();
    expect(dialog!.textContent).toContain('Confirm delete');
    const heading = dialog!.querySelector('h2') as HTMLElement;
    expect(dialog!.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(dialog!.getAttribute('aria-label')).toBeNull();
    await expectNoA11yViolations(dialog!);
  });

  it('has no WCAG 2.x A/AA violations on an open custom select', async () => {
    await TestBed.configureTestingModule({ imports: [OpenCustomSelectHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(OpenCustomSelectHostComponent);
    fixture.detectChanges();
    const select = fixture.debugElement.query(By.directive(CustomSelectComponent))
      .componentInstance as CustomSelectComponent;
    select.openDropdown();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="listbox"]')).toBeTruthy();
    await expectNoA11yViolations(fixture.nativeElement);
  });

  it('has no WCAG 2.x A/AA violations on an open context menu', async () => {
    await TestBed.configureTestingModule({ imports: [OpenContextMenuHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(OpenContextMenuHostComponent);
    fixture.detectChanges();
    const menu = fixture.debugElement.query(By.directive(ContextMenuDirective))
      .injector.get(ContextMenuDirective);
    menu.open({ x: 8, y: 8 });
    fixture.detectChanges();
    const pane = document.querySelector('.cdk-overlay-pane');
    expect(pane?.querySelector('[role="menu"]')).toBeTruthy();
    await expectNoA11yViolations(fixture.nativeElement);
    await expectNoA11yViolations(pane!);
  });

  it('has no WCAG 2.x A/AA violations on an open popover', async () => {
    await TestBed.configureTestingModule({ imports: [OpenPopoverHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(OpenPopoverHostComponent);
    fixture.detectChanges();
    const popover = fixture.debugElement.query(By.directive(PopoverComponent))
      .componentInstance as PopoverComponent;
    popover.open();
    fixture.detectChanges();
    const pane = document.querySelector('.cdk-overlay-pane');
    expect(pane?.querySelector('[role="dialog"]')).toBeTruthy();
    await expectNoA11yViolations(fixture.nativeElement);
    await expectNoA11yViolations(pane!);
  });

  it('has no WCAG 2.x A/AA violations on an open hover card', async () => {
    await TestBed.configureTestingModule({ imports: [OpenHoverCardHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(OpenHoverCardHostComponent);
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.directive(HoverCardComponent))
      .componentInstance as HoverCardComponent;
    card.open();
    fixture.detectChanges();
    const pane = document.querySelector('.cdk-overlay-pane');
    expect(pane?.querySelector('[role="dialog"]')).toBeTruthy();
    await expectNoA11yViolations(fixture.nativeElement);
    await expectNoA11yViolations(pane!);
  });

  it('has no WCAG 2.x A/AA violations on an open drawer', async () => {
    await TestBed.configureTestingModule({
      imports: [OpenDrawerHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    fixture = TestBed.createComponent(OpenDrawerHostComponent);
    fixture.detectChanges();
    const drawer = fixture.debugElement.query(By.directive(DrawerDirective))
      .injector.get(DrawerDirective);
    drawer.openDrawer();
    fixture.detectChanges();
    const pane = document.querySelector('.cdk-overlay-pane');
    expect(pane?.querySelector('[role="dialog"]')).toBeTruthy();
    await expectNoA11yViolations(fixture.nativeElement);
    await expectNoA11yViolations(pane!);
  });

  it('has no WCAG 2.x A/AA violations on an open bottom sheet', async () => {
    await TestBed.configureTestingModule({
      imports: [OpenBottomSheetHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    fixture = TestBed.createComponent(OpenBottomSheetHostComponent);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog?.textContent).toContain('Share this page');
    await expectNoA11yViolations(fixture.nativeElement);
  });
});
