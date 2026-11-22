import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../tw-merge/tw-merge';

/**
 * A day or unread divider in a transcript.
 *
 * @example
 * <ply-chat-marker label="Today"></ply-chat-marker>
 */
@Component({
  selector: 'ply-chat-marker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-marker.component.html',
  host: { '[class]': 'hostCls()' },
})
export class ChatMarkerComponent {
  /** Extra host classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  /** Short label, such as Today or Unread. */
  readonly label = input.required<string>();

  protected readonly hostCls = computed(() => cn('flex justify-center', this.extraClass()));
}
