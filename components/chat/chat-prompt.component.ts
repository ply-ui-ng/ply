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
import { BASE_UI_I18N } from '../i18n/i18n';

const PROMPT_MAX_ROWS = 10;

/**
 * Composer for {@link ChatComponent}: starts as a single-line input and auto-expands
 * up to 10 rows as the user types, with send and stop controls.
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
  protected readonly i18n = inject(BASE_UI_I18N);
  /** Additional host classes. */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Placeholder for the composer.
   * @example
   * <ply-chat-prompt placeholder="Ask anything…"></ply-chat-prompt>
   */
  readonly placeholder = input('Type a message…');

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

  protected resizeComposer(): void {
    if (!this.isBrowser) return;
    const el = this.composer()?.nativeElement;
    if (!el) return;

    const styles = getComputedStyle(el);
    const lineHeight = Number.parseFloat(styles.lineHeight) || 20;
    const padding =
      (Number.parseFloat(styles.paddingTop) || 0) + (Number.parseFloat(styles.paddingBottom) || 0);
    const singleRow = Math.ceil(lineHeight + padding);
    const maxHeight = Math.ceil(lineHeight * PROMPT_MAX_ROWS + padding);

    if (!el.value) {
      el.style.height = `${singleRow}px`;
      el.style.overflowY = 'hidden';
      return;
    }

    el.style.height = '0px';
    const nextHeight = Math.max(singleRow, Math.min(el.scrollHeight, maxHeight));
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }
}
