import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';

import { IconComponent } from '../../icon/icon.component';
import { cn } from '../../tw-merge/tw-merge';

/**
 * An individual breadcrumb link within a `ply-breadcrumb`.
 * The last item (current page, usually without `link`) truncates with an ellipsis
 * and stays on a single row; hover the crumb to see the full `label` via `title`.
 *
 * @example
 * <ply-breadcrumb-item label="Products" link="/products"></ply-breadcrumb-item>
 * <ply-breadcrumb-item label="A long current page title"></ply-breadcrumb-item>
 */
@Component({
  selector: 'ply-breadcrumb-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './breadcrumb-item.component.html',
  host: { '[class]': 'hostCls()' } })
export class BreadcrumbItemComponent {
  readonly extraClass = input('', { alias: 'class' });
  readonly icon      = input<string | undefined>(undefined);
  readonly link      = input<string | undefined>(undefined);
  readonly label     = input('');
  readonly separator = input<string | undefined>(undefined);

  protected readonly hostCls = computed(() =>
    cn(
      // Keep ancestors on one row; only the current (last) crumb may shrink + truncate.
      'inline-flex max-w-full shrink-0 items-center gap-4 text-sm after:mx-2 after:content-["|"] last-of-type:min-w-0 last-of-type:shrink last-of-type:overflow-hidden last-of-type:after:content-[""] peer pointer-events-none',
      this.extraClass(),
    ),
  );
}
