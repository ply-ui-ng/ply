import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TABLE_DIRECTIVES } from './table.directives';

@Component({
  standalone: true,
  imports: [...TABLE_DIRECTIVES],
  template: `
    <table ply-table>
      <caption ply-table-caption>Invoices</caption>
      <thead ply-table-header>
        <tr ply-table-row>
          <th ply-table-head>Invoice</th>
          <th ply-table-head>Status</th>
        </tr>
      </thead>
      <tbody ply-table-body>
        <tr ply-table-row>
          <td ply-table-cell>INV-001</td>
          <td ply-table-cell>Paid</td>
        </tr>
      </tbody>
      <tfoot ply-table-footer>
        <tr ply-table-row>
          <td ply-table-cell>Total</td>
          <td ply-table-cell>1</td>
        </tr>
      </tfoot>
    </table>
  `,
})
class TableHostComponent {}

describe('TableDirective', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('styles native table parts without wrapping extra elements', async () => {
    await TestBed.configureTestingModule({
      imports: [TableHostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(TableHostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('table[ply-table]')).toBeTruthy();
    expect(root.querySelector('thead[ply-table-header]')).toBeTruthy();
    expect(root.querySelector('tbody[ply-table-body]')).toBeTruthy();
    expect(root.querySelector('tfoot[ply-table-footer]')).toBeTruthy();
    expect(root.querySelector('caption[ply-table-caption]')?.textContent).toContain('Invoices');
    expect(root.querySelectorAll('th[ply-table-head]').length).toBe(2);
    expect(root.querySelectorAll('td[ply-table-cell]').length).toBe(4);
    expect(root.querySelector('ply-table')).toBeNull();
    fixture.destroy();
  });

  it('merges extra class onto native table parts', async () => {
    @Component({
      standalone: true,
      imports: [...TABLE_DIRECTIVES],
      template: `
        <table ply-table class="max-w-xl">
          <thead ply-table-header>
            <tr ply-table-row>
              <th ply-table-head class="text-right">Amount</th>
            </tr>
          </thead>
        </table>
      `,
    })
    class ExtraClassHostComponent {}

    await TestBed.configureTestingModule({
      imports: [ExtraClassHostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(ExtraClassHostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('table')?.className).toContain('max-w-xl');
    const th = root.querySelector('th');
    expect(th?.className).toContain('text-right');
    expect(th?.className).not.toContain('text-left');
    fixture.destroy();
  });
});
