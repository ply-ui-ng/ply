import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CustomSelectComponent } from './custom-select.component';
import { CustomSelectHarness } from './custom-select.harness';

@Component({
  standalone: true,
  imports: [CustomSelectComponent],
  template: `
    <ply-custom-select
      label="Favorite car"
      [options]="options"
      displayKey="label"
      valueKey="value"
    />
  `,
})
class SelectHostComponent {
  readonly options = [
    { label: 'Tesla', value: 'tesla' },
    { label: 'BMW', value: 'bmw' },
    { label: 'Audi', value: 'audi' },
  ];
}

describe('CustomSelectHarness', () => {
  let fixture: ComponentFixture<SelectHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(SelectHostComponent);
    fixture.detectChanges();
  });

  async function select(): Promise<CustomSelectHarness> {
    return TestbedHarnessEnvironment.loader(fixture).getHarness(CustomSelectHarness);
  }

  it('opens, lists options, and selects by label', async () => {
    const harness = await select();
    expect(await harness.isOpen()).toBe(false);
    expect(await harness.getOptions()).toEqual(['Tesla', 'BMW', 'Audi']);
    expect(await harness.isOpen()).toBe(true);

    await harness.selectOption('BMW');
    expect(await harness.isOpen()).toBe(false);
    expect(await harness.getValueText()).toContain('BMW');
  });

  it('closes the listbox on Escape', async () => {
    const harness = await select();
    await harness.open();
    expect(await harness.isOpen()).toBe(true);
    await harness.close();
    expect(await harness.isOpen()).toBe(false);
  });
});
