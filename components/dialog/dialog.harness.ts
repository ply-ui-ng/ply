import { ComponentHarness } from '@angular/cdk/testing';

/**
 * CDK harness for a service-opened dialog (`ply-dialog-container`).
 * Copied with `npx ply-ui-cli add dialog`.
 *
 * The overlay is appended to `document.body`, so load it from the document
 * root — not the component fixture:
 *
 * @example
 * dialogs.open(ConfirmDialog);
 * const loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
 * const dialog = await loader.getHarness(DialogHarness);
 * expect(await dialog.getTitle()).toBe('Confirm delete');
 * await dialog.close();
 */
export class DialogHarness extends ComponentHarness {
  static hostSelector = 'ply-dialog-container';

  private readonly _title = this.locatorForOptional(
    '[role="dialog"] h1, [role="dialog"] h2, [role="dialog"] h3',
  );
  private readonly _box = this.locatorFor('[role="dialog"]');
  private readonly _closeButton = this.locatorForOptional('[ply-dialog-close]');
  private readonly _backdrop = this.locatorFor('[role="presentation"]');

  /** Heading inside the dialog box, or `null` when the dialog is unlabelled. */
  async getTitle(): Promise<string | null> {
    const heading = await this._title();
    if (!heading) return null;
    const text = (await heading.text()).trim();
    return text || null;
  }

  /** Visible text of the dialog box (title, body, and actions). */
  async getText(): Promise<string> {
    return (await (await this._box()).text()).trim();
  }

  /**
   * Closes via `[ply-dialog-close]` when present, otherwise the backdrop.
   * The host is destroyed; do not reuse this harness after `close()`.
   */
  async close(): Promise<void> {
    const button = await this._closeButton();
    if (button) {
      await button.click();
      return;
    }
    await (await this._backdrop()).click();
  }
}
