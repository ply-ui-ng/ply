import { Directive, computed, input } from '@angular/core';
import { cn } from '../tw-merge/tw-merge';

/**
 * Styled native `<table>`. Compose with `ply-table-header`, `ply-table-body`,
 * `ply-table-row`, `ply-table-head`, `ply-table-cell`, and `ply-table-caption`.
 * For sort, page, select, or resize, use Pro `data-table`.
 *
 * @example
 * <div class="relative w-full overflow-auto">
 *   <table ply-table>
 *     <caption ply-table-caption>Invoices</caption>
 *     <thead ply-table-header>
 *       <tr ply-table-row>
 *         <th ply-table-head>Invoice</th>
 *         <th ply-table-head>Status</th>
 *       </tr>
 *     </thead>
 *     <tbody ply-table-body>
 *       <tr ply-table-row>
 *         <td ply-table-cell>INV-001</td>
 *         <td ply-table-cell>Paid</td>
 *       </tr>
 *     </tbody>
 *   </table>
 * </div>
 */
@Directive({
  selector: 'table[ply-table]',
  host: { '[class]': 'classes()' },
})
export class TableDirective {
  /** Extra classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  readonly classes = computed(() =>
    cn('w-full caption-bottom text-sm', this.extraClass()),
  );
}

/**
 * Native `<thead>` for {@link TableDirective}.
 *
 * @example
 * <thead ply-table-header>…</thead>
 */
@Directive({
  selector: 'thead[ply-table-header]',
  host: { '[class]': 'classes()' },
})
export class TableHeaderDirective {
  /** Extra classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  readonly classes = computed(() =>
    cn('[&_tr]:border-b [&_tr]:border-[var(--ply-border)]', this.extraClass()),
  );
}

/**
 * Native `<tbody>` for {@link TableDirective}.
 *
 * @example
 * <tbody ply-table-body>…</tbody>
 */
@Directive({
  selector: 'tbody[ply-table-body]',
  host: { '[class]': 'classes()' },
})
export class TableBodyDirective {
  /** Extra classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  readonly classes = computed(() =>
    cn('[&_tr:last-child]:border-0', this.extraClass()),
  );
}

/**
 * Native `<tfoot>` for {@link TableDirective}.
 *
 * @example
 * <tfoot ply-table-footer>…</tfoot>
 */
@Directive({
  selector: 'tfoot[ply-table-footer]',
  host: { '[class]': 'classes()' },
})
export class TableFooterDirective {
  /** Extra classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  readonly classes = computed(() =>
    cn(
      'border-t border-[var(--ply-border)] bg-[var(--ply-muted)]/50 font-medium [&>tr]:last:border-b-0',
      this.extraClass(),
    ),
  );
}

/**
 * Native `<tr>` for {@link TableDirective}.
 *
 * @example
 * <tr ply-table-row>…</tr>
 */
@Directive({
  selector: 'tr[ply-table-row]',
  host: { '[class]': 'classes()' },
})
export class TableRowDirective {
  /** Extra classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  readonly classes = computed(() =>
    cn(
      'border-b border-[var(--ply-border)] transition-colors hover:bg-[var(--ply-muted)]/50',
      this.extraClass(),
    ),
  );
}

/**
 * Native `<th>` for {@link TableDirective}.
 *
 * @example
 * <th ply-table-head>Invoice</th>
 */
@Directive({
  selector: 'th[ply-table-head]',
  host: { '[class]': 'classes()' },
})
export class TableHeadDirective {
  /** Extra classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  readonly classes = computed(() =>
    cn(
      'h-10 px-4 text-left align-middle text-xs font-medium text-[var(--ply-muted-foreground)] [&:has([role=checkbox])]:pr-0',
      this.extraClass(),
    ),
  );
}

/**
 * Native `<td>` for {@link TableDirective}. Not the Pro data-table cell template (`plyTableCell`).
 *
 * @example
 * <td ply-table-cell>INV-001</td>
 */
@Directive({
  selector: 'td[ply-table-cell]',
  host: { '[class]': 'classes()' },
})
export class TableTdDirective {
  /** Extra classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  readonly classes = computed(() =>
    cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', this.extraClass()),
  );
}

/**
 * Native `<caption>` for {@link TableDirective}.
 *
 * @example
 * <caption ply-table-caption>A list of recent invoices.</caption>
 */
@Directive({
  selector: 'caption[ply-table-caption]',
  host: { '[class]': 'classes()' },
})
export class TableCaptionDirective {
  /** Extra classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  readonly classes = computed(() =>
    cn('mt-4 text-sm text-[var(--ply-muted-foreground)]', this.extraClass()),
  );
}

/** All table part directives — spread into a component `imports` array. */
export const TABLE_DIRECTIVES = [
  TableDirective,
  TableHeaderDirective,
  TableBodyDirective,
  TableFooterDirective,
  TableRowDirective,
  TableHeadDirective,
  TableTdDirective,
  TableCaptionDirective,
] as const;
