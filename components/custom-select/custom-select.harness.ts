import { ComponentHarness, TestKey } from '@angular/cdk/testing';

/**
 * CDK harness for {@link CustomSelectComponent}. Copied with
 * `npx ply-ui-cli add custom-select`.
 *
 * @example
 * const loader = TestbedHarnessEnvironment.loader(fixture);
 * const select = await loader.getHarness(CustomSelectHarness);
 * await select.selectOption('Tesla');
 * expect(await select.getValueText()).toContain('Tesla');
 */
export class CustomSelectHarness extends ComponentHarness {
  static hostSelector = 'ply-custom-select';

  private readonly _trigger = this.locatorFor('button[role="combobox"]');
  private readonly _options = this.locatorForAll('[role="option"]');

  /** Opens the listbox if it is closed. */
  async open(): Promise<void> {
    if (!(await this.isOpen())) {
      await (await this._trigger()).click();
    }
  }

  /** Closes the listbox with Escape. */
  async close(): Promise<void> {
    if (await this.isOpen()) {
      await (await this._trigger()).sendKeys(TestKey.ESCAPE);
    }
  }

  async isOpen(): Promise<boolean> {
    return (await (await this._trigger()).getAttribute('aria-expanded')) === 'true';
  }

  /** Visible trigger label (selected option, or the placeholder). */
  async getValueText(): Promise<string> {
    return (await (await this._trigger()).text()).trim();
  }

  /** Option labels. Opens the listbox if needed. */
  async getOptions(): Promise<string[]> {
    await this.open();
    const options = await this._options();
    const labels: string[] = [];
    for (const option of options) {
      labels.push((await option.text()).trim());
    }
    return labels;
  }

  /** Opens the listbox and clicks the first option whose text matches `label`. */
  async selectOption(label: string): Promise<void> {
    await this.open();
    const options = await this._options();
    for (const option of options) {
      const text = (await option.text()).trim();
      if (text === label || text.includes(label)) {
        await option.click();
        return;
      }
    }
    throw new Error(`CustomSelectHarness: no option labelled "${label}"`);
  }
}
