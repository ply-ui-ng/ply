import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../tw-merge/tw-merge';

/**
 * Left navigation slot for `ply-sidenav`.
 *
 * @example
 * <ply-sidenav-nav>
 *   <ply-nav-list>...</ply-nav-list>
 * </ply-sidenav-nav>
 */
@Component({
  selector: 'ply-sidenav-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidenav-nav.component.html',
  host: { '[class]': 'hostCls()' },
})
export class SidenavNavComponent {
  /**
   * Extra host classes merged via `cn()`.
   *
   * @example
   * <ply-sidenav-nav class="px-2"></ply-sidenav-nav>
   */
  readonly extraClass = input('', { alias: 'class' });

  protected readonly hostCls = computed(() =>
    cn('block w-60 min-w-60 h-full overflow-y-auto overflow-x-hidden', this.extraClass()),
  );
}
