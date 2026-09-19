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
});
