import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../tw-merge/tw-merge';

/**
 * Main content slot for `ply-sidenav` (typically hosts a router outlet).
 *
 * @example
 * <ply-sidenav-body>
 *   <router-outlet></router-outlet>
 * </ply-sidenav-body>
 */
@Component({
  selector: 'ply-sidenav-body',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidenav-body.component.html',
  host: { '[class]': 'hostCls()' },
})
export class SidenavBodyComponent {
  /**
   * Extra host classes merged via `cn()`.
   *
   * @example
   * <ply-sidenav-body class="bg-white dark:bg-slate-950"></ply-sidenav-body>
   */
  readonly extraClass = input('', { alias: 'class' });

  protected readonly hostCls = computed(() =>
    cn('flex-1 overflow-y-auto overflow-x-auto block h-full', this.extraClass())
  );
}
