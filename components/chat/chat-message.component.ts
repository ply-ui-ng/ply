import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChatMessage } from '../types';
import { cn } from '../tw-merge/tw-merge';
import { AvatarComponent } from '../avatar/avatar.component';
import { BadgeComponent } from '../badge/badge.component';
import { IconComponent } from '../icon/icon.component';
import { SpinnerComponent } from '../spinner/spinner.component';

/**
 * A single chat turn — user, assistant, system, or tool call.
 *
 * @example
 * <ply-chat-message [message]="msg"></ply-chat-message>
 */
@Component({
  selector: 'ply-chat-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, BadgeComponent, IconComponent, SpinnerComponent],
  templateUrl: './chat-message.component.html',
  host: { '[class]': 'hostCls()' },
})
export class ChatMessageComponent {
  /** Additional host classes. */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Message to render.
   * @example
   * <ply-chat-message [message]="{ id: '1', role: 'user', content: 'Hi' }"></ply-chat-message>
   */
  readonly message = input.required<ChatMessage>();

  protected readonly hostCls = computed(() => cn('flex w-full gap-3', this.extraClass()));

  readonly isUser = computed(() => this.message().role === 'user');
  readonly isTool = computed(() => this.message().role === 'tool');
  readonly isSystem = computed(() => this.message().role === 'system');

  readonly initials = computed(() => {
    const msg = this.message();
    if (msg.name) return msg.name.slice(0, 2).toUpperCase();
    if (msg.role === 'user') return 'You';
    if (msg.role === 'assistant') return 'AI';
    if (msg.role === 'tool') return 'Fn';
    return 'Sys';
  });

  readonly toolBadgeColor = computed(() => {
    switch (this.message().toolStatus) {
      case 'error':
        return 'danger';
      case 'done':
        return 'success';
      case 'running':
      case 'pending':
        return 'primary';
      default:
        return 'primary';
    }
  });
}
