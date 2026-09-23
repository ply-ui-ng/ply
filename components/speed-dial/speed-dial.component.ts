import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { readingEdge, resolveCornerPosition } from '../direction/direction';
import { injectElementDirection } from '../direction/inject-direction';
import { IconButtonColor, IconButtonSize, SpeedDialDirection, SpeedDialPosition } from '../types';
import { cn } from '../tw-merge/tw-merge';

/**
 * A single action shown when a {@link SpeedDialComponent} is open.
 */
export interface SpeedDialAction {
  /** Icon name from the sprite sheet. */
  icon: string;
  /** Optional visible label next to the action button. */
  label?: string;
  /** Accessible name; falls back to `label` or `icon`. */
  ariaLabel?: string;
  /** Optional semantic color for this action button. */
  color?: IconButtonColor;
  /** When true, the action cannot be activated. */
  disabled?: boolean;
  /** Optional id for tracking / event payloads. */
  id?: string;
}

/**
 * Floating action button that expands a stack of secondary actions (speed dial).
 * Free tier.
 *
 * @example
 * <ply-speed-dial [actions]="actions" (actionClick)="onAction($event)"></ply-speed-dial>
 *
 * @example
 * <ply-speed-dial
 *   [actions]="actions"
 *   direction="up"
 *   position="bottom-right"
 *   [showLabels]="true"
 *   [fixed]="false">
 * </ply-speed-dial>
 */
@Component({
  selector: 'ply-speed-dial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, IconButtonDirective],
  templateUrl: './speed-dial.component.html',
  host: {
    '[class]': 'hostCls()',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class SpeedDialComponent {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly writingDirection = injectElementDirection();

  /**
   * Actions revealed when the dial is open.
   *
   * @example
   * <ply-speed-dial [actions]="[{ icon: 'edit', label: 'Edit' }]"></ply-speed-dial>
   */
  readonly actions = input<SpeedDialAction[]>([]);

  /**
   * Direction the action stack expands from the trigger.
   *
   * @example
   * <ply-speed-dial direction="left" [actions]="actions"></ply-speed-dial>
   */
  readonly direction = input<SpeedDialDirection>('up');

  /**
   * Corner placement when positioned against the viewport or a relative parent.
   *
   * @example
   * <ply-speed-dial position="bottom-left" [actions]="actions"></ply-speed-dial>
   */
  readonly position = input<SpeedDialPosition>('bottom-end');

  /**
   * When true (default), uses `position: fixed`. Set false for `absolute` inside a `relative` parent.
   *
   * @example
   * <ply-speed-dial [fixed]="false" [actions]="actions"></ply-speed-dial>
   */
  readonly fixed = input(true, { transform: booleanAttribute });

  /**
   * Trigger / default action button color.
   *
   * @example
   * <ply-speed-dial color="accent" [actions]="actions"></ply-speed-dial>
   */
  readonly color = input<IconButtonColor>('primary');

  /**
   * Size of the trigger and action icon buttons.
   *
   * @example
   * <ply-speed-dial size="lg" [actions]="actions"></ply-speed-dial>
   */
  readonly size = input<IconButtonSize>('lg');

  /**
   * Icon shown on the trigger when closed.
   *
   * @example
   * <ply-speed-dial openIcon="plus" [actions]="actions"></ply-speed-dial>
   */
  readonly openIcon = input('plus');

  /**
   * Icon shown on the trigger when open.
   *
   * @example
   * <ply-speed-dial closeIcon="x" [actions]="actions"></ply-speed-dial>
   */
  readonly closeIcon = input('x');

  /**
   * When true, shows each action’s `label` beside the button.
   *
   * @example
   * <ply-speed-dial [showLabels]="true" [actions]="actions"></ply-speed-dial>
   */
  readonly showLabels = input(false, { transform: booleanAttribute });

  /**
   * When true, clicking an action closes the dial (default).
   *
   * @example
   * <ply-speed-dial [closeOnAction]="false" [actions]="actions"></ply-speed-dial>
   */
  readonly closeOnAction = input(true, { transform: booleanAttribute });

  /**
   * Accessible name for the speed-dial group / trigger.
   *
   * @example
   * <ply-speed-dial ariaLabel="Create" [actions]="actions"></ply-speed-dial>
   */
  readonly ariaLabel = input('Speed dial');

  /**
   * Extra host classes merged via `cn()`.
   *
   * @example
   * <ply-speed-dial class="!bottom-20" [actions]="actions"></ply-speed-dial>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Open state (two-way). Prefer `[(open)]` when controlling from outside.
   *
   * @example
   * <ply-speed-dial [(open)]="isOpen" [actions]="actions"></ply-speed-dial>
   */
  readonly open = model(false);

  /**
   * Emitted when an enabled action button is clicked.
   *
   * @example
   * <ply-speed-dial [actions]="actions" (actionClick)="handle($event)"></ply-speed-dial>
   */
  readonly actionClick = output<SpeedDialAction>();

  readonly hostCls = computed(() => {
    const layer = this.fixed() ? 'fixed' : 'absolute';
    return cn(layer, 'z-50', this.positionClasses(), this.extraClass());
  });

  readonly triggerAriaLabel = computed(() =>
    this.open() ? `Close ${this.ariaLabel()}` : this.ariaLabel(),
  );

  readonly actionsGapClass = computed(() => 'gap-3');

  readonly labelSideClass = computed(() => {
    const pos = resolveCornerPosition(this.position(), this.writingDirection());
    if (this.expandDirection() === 'left' || this.expandDirection() === 'right') {
      return 'flex-col';
    }
    // Keep labels inward from the corner so they stay on-screen.
    if (pos === 'bottom-right' || pos === 'top-right') {
      return 'flex-row'; // label | button (label to the left)
    }
    return 'flex-row-reverse'; // button | label (label to the right)
  });

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  onActionClick(action: SpeedDialAction, event: MouseEvent): void {
    event.stopPropagation();
    if (action.disabled) {
      return;
    }
    this.actionClick.emit(action);
    if (this.closeOnAction()) {
      this.close();
    }
  }

  actionAriaLabel(action: SpeedDialAction): string {
    return action.ariaLabel || action.label || action.icon;
  }

  actionDelay(index: number): string {
    const count = this.actions().length;
    const i = this.open() ? index : count - 1 - index;
    return `${i * 40}ms`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.close();
    }
  }

  /** `left` / `right` expansion follows the start/end edges. Up and down stay put. */
  protected readonly expandDirection = computed((): SpeedDialDirection => {
    const dir = this.direction();
    if (dir === 'left' || dir === 'right') return readingEdge(dir, this.writingDirection());
    return dir;
  });

  private positionClasses(): string {
    const resolved = resolveCornerPosition(this.position(), this.writingDirection());
    const map: Record<string, string> = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6',
    };
    return map[resolved] ?? map['bottom-right'];
  }
}
