import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../tw-merge/tw-merge';
import { IconComponent } from '../icon/icon.component';

/**
 * A file chip under a chat bubble.
 *
 * @example
 * <ply-chat-attachment name="brief.pdf" detail="24 KB"></ply-chat-attachment>
 */
@Component({
  selector: 'ply-chat-attachment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './chat-attachment.component.html',
  host: { '[class]': 'hostCls()' },
})
export class ChatAttachmentComponent {
  /** Extra host classes merged via `cn()`. */
  readonly extraClass = input('', { alias: 'class' });

  /** File name. */
  readonly name = input.required<string>();

  /** Size or kind. */
  readonly detail = input('');

  protected readonly hostCls = computed(() => cn('inline-flex max-w-full', this.extraClass()));
}
