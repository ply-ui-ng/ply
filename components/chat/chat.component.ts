import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core';
import { ChatMessage } from '../types';
import { cn } from '../tw-merge/tw-merge';
import { AvatarComponent } from '../avatar/avatar.component';
import { ChatMessageComponent } from './chat-message.component';
import { ChatPromptComponent } from './chat-prompt.component';
import { ChatScrollerComponent } from './chat-scroller.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

/**
 * Interactive chat surface modeled after `ply-social-widget-chat`: optional participant
 * header with presence indicator, tonal transcript well, streaming bubbles, file attachments,
 * tool-call cards, and a rounded prompt composer.
 *
 * @example
 * <ply-chat title="Ply Assistant" subtitle="Online" [online]="true" [messages]="thread" [streaming]="busy" (send)="ask($event)" (stop)="abort()"></ply-chat>
 */
@Component({
  selector: 'ply-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, ChatMessageComponent, ChatPromptComponent, ChatScrollerComponent, EmptyStateComponent],
  templateUrl: './chat.component.html',
  host: { '[class]': 'hostCls()' },
})
export class ChatComponent {
  /**
   * Additional host classes.
   * @example
   * <ply-chat class="min-h-120" [messages]="thread"></ply-chat>
   */
  readonly extraClass = input('', { alias: 'class' });

  /** Optional participant or assistant name shown in the top bar. */
  readonly title = input('');

  /** Optional status or role line under `title` (e.g. `"Online"` or `"Support"`). */
  readonly subtitle = input('');

  /** Optional avatar image shown in the top bar. */
  readonly avatarUrl = input('');

  /** Shows a green presence dot on the header avatar when `title` is set. */
  readonly online = input(false, { transform: booleanAttribute });

  /**
   * Ordered conversation turns.
   * @example
   * <ply-chat [messages]="[{ id: '1', role: 'user', content: 'Hello' }]"></ply-chat>
   */
  readonly messages = input<ChatMessage[]>([]);

  /**
   * True while an assistant reply is streaming.
   * @example
   * <ply-chat [streaming]="true" [messages]="thread"></ply-chat>
   */
  readonly streaming = input(false, { transform: booleanAttribute });

  /**
   * Composer placeholder.
   * @example
   * <ply-chat placeholder="Ask the docs…"></ply-chat>
   */
  readonly placeholder = input('Type a message…');

  /**
   * Disables the composer.
   * @example
   * <ply-chat disabled></ply-chat>
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Empty-state title when `messages` is empty.
   * @example
   * <ply-chat emptyTitle="Ask anything"></ply-chat>
   */
  readonly emptyTitle = input('How can I help?');

  /**
   * Empty-state description.
   * @example
   * <ply-chat emptyDescription="Ask about your codebase."></ply-chat>
   */
  readonly emptyDescription = input('Send a message to start the conversation.');

  /** Emits the user prompt. */
  readonly send = output<string>();

  /** Emits when the user stops generation. */
  readonly stop = output<void>();

  protected readonly headerInitials = computed(() => {
    const label = this.title().trim();
    if (!label) return 'AI';
    const parts = label.split(/\s+/);
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : label.slice(0, 2).toUpperCase();
  });

  protected readonly hostCls = computed(() =>
    cn(
      'flex h-full min-h-105 flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-start dark:border-slate-700 dark:bg-slate-900',
      this.extraClass(),
    ),
  );
}
