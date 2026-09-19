import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { cn } from '../tw-merge/tw-merge';
import { IconComponent } from '../icon/icon.component';
import { IconButtonDirective } from '../button/ply-icon-button.directive';

const PROMPT_MAX_ROWS = 10;

/**
 * Composer for {@link ChatComponent}: textarea, send, and stop while streaming.
 *
 * @example
 * <ply-chat-prompt (send)="onSend($event)" [streaming]="busy" (stop)="abort()"></ply-chat-prompt>
 */
@Component({
  selector: 'ply-chat-prompt',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconComponent, IconButtonDirective],
  templateUrl: './chat-prompt.component.html',
  host: { '[class]': 'hostCls()' },
})
export class ChatPromptComponent {
  /** Additional host classes. */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Placeholder for the composer.
   * @example
   * <ply-chat-prompt placeholder="Ask anything…"></ply-chat-prompt>
   */
  readonly placeholder = input('Send a message…');

  /**
   * When true, Enter sends Stop instead of Send.
   * @example
   * <ply-chat-prompt [streaming]="true" (stop)="abort()"></ply-chat-prompt>
   */
  readonly streaming = input(false, { transform: booleanAttribute });

  /**
   * Disables the composer.
   * @example
   * <ply-chat-prompt disabled></ply-chat-prompt>
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emits the trimmed message when the user sends. */
  readonly send = output<string>();

  /** Emits when the user stops a streaming response. */
  readonly stop = output<void>();

  readonly draft = signal('');
  readonly composer = viewChild<ElementRef<HTMLTextAreaElement>>('composer');

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly hostCls = computed(() => cn('block w-full', this.extraClass()));

  readonly canSend = computed(() => this.draft().trim().length > 0 && !this.disabled() && !this.streaming());

  constructor() {
    afterRenderEffect(() => {
      this.draft();
      this.composer();
      this.resizeComposer();
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  submit(): void {
    if (this.streaming()) {
      this.stop.emit();
      return;
    }
    const text = this.draft().trim();
    if (!text || this.disabled()) return;
    this.send.emit(text);
    this.draft.set('');
  }

  private resizeComposer(): void {
    if (!this.isBrowser) return;
    const el = this.composer()?.nativeElement;
    if (!el) return;

    el.style.height = 'auto';
    const styles = getComputedStyle(el);
    const lineHeight = Number.parseFloat(styles.lineHeight) || 20;
    const padding =
      Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
    const maxHeight = lineHeight * PROMPT_MAX_ROWS + padding;
    const scrollHeight = el.scrollHeight;
    el.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    el.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }
}
