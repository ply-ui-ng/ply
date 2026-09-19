import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FocusTrapFactory } from '@angular/cdk/a11y';
import { DialogComponent } from './dialog/dialog.component';
import { DialogHeaderComponent } from './dialog-header/dialog-header.component';
import { DialogBodyComponent } from './dialog-body/dialog-body.component';
import { DialogCloseDirective } from './dialog-close.directive';
import { DialogService } from './dialog.service';
import { DialogHarness } from './dialog.harness';

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
class HarnessDialogComponent {}

@Component({
  standalone: true,
  template: `<button type="button">Open</button>`,
})
class DialogHostComponent {}

describe('DialogHarness', () => {
  let fixture: ComponentFixture<DialogHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogHostComponent, HarnessDialogComponent],
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
    fixture = TestBed.createComponent(DialogHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    document.querySelectorAll('ply-dialog-container').forEach((el) => el.remove());
    TestBed.resetTestingModule();
  });

  it('reads title and body from a document-root overlay', async () => {
    TestBed.inject(DialogService).open(HarnessDialogComponent);
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
      DialogHarness,
    );
    expect(await harness.getTitle()).toBe('Confirm delete');
    expect(await harness.getText()).toContain('This cannot be undone.');

    await harness.close();
    const remaining = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarnessOrNull(
      DialogHarness,
    );
    expect(remaining).toBeNull();
  });
});
