import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { cn } from '../tw-merge/tw-merge';

/**
 * A container component for breadcrumb navigation.
 * Usually contains multiple `ply-breadcrumb-item` components.
 * Stays on a single row; the current (last) item truncates with an ellipsis.
 *
 * @example
 * <ply-breadcrumb>
 *   <ply-breadcrumb-item label="Home" link="/"></ply-breadcrumb-item>
 *   <ply-breadcrumb-item label="Dashboard" link="/dashboard"></ply-breadcrumb-item>
 *   <ply-breadcrumb-item label="A very long current page title"></ply-breadcrumb-item>
 * </ply-breadcrumb>
 */
@Component({
  selector: 'ply-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './breadcrumb.component.html',
  host: { '[class]': 'hostClass()' },
})
export class BreadcrumbComponent {
  /**
   * Extra host classes merged via `cn()`.
   *
   * @example
   * <ply-breadcrumb class="mb-6"></ply-breadcrumb>
   */
  readonly extraClass = input('', { alias: 'class' });

  protected readonly hostClass = computed(() => cn('block min-w-0 max-w-full', this.extraClass()));
}
