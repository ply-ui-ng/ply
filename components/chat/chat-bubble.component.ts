import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { ChatRole } from '../types';
import { cn } from '../tw-merge/tw-merge';

/**
 * One message bubble. User turns sit on the accent; assistant turns sit on a raised surface.
 *
 * @example
 * <ply-chat-bubble role="user" content="Hello"></ply-chat-bubble>
 */
@Component({
  selector: 'ply-chat-bubble',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-bubble.component.html',
  host: { '[class]': 'hostCls()' },
})
export class ChatBubbleComponent {
  /** Extra host classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  /** `user` uses the accent fill. Any other role uses the raised surface. */
  readonly role = input<ChatRole>('assistant');

  /** Message text. */
  readonly content = input('');

  /** Shows the streaming caret. */
  readonly streaming = input(false, { transform: booleanAttribute });

  protected readonly user = computed(() => this.role() === 'user');
  protected readonly hostCls = computed(() => cn('block max-w-full', this.extraClass()));
}
