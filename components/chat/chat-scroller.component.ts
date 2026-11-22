import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * A transcript pane that stays on the latest message until the reader scrolls up.
 *
 * @example
 * <ply-chat-scroller [pin]="messages().length">
 *   <ply-chat-bubble role="assistant" content="Hello"></ply-chat-bubble>
 * </ply-chat-scroller>
 */
@Component({
  selector: 'ply-chat-scroller',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-scroller.component.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
})
export class ChatScrollerComponent {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly pane = viewChild<ElementRef<HTMLElement>>('pane');
  private nearBottom = true;

  /** Changes when the transcript grows. The pane follows while the reader is near the end. */
  readonly pin = input(0);

  constructor() {
    afterRenderEffect(() => {
      this.pin();
      if (!this.isBrowser) return;
      const element = this.pane()?.nativeElement;
      if (!element || !this.nearBottom) return;
      element.scrollTop = element.scrollHeight;
    });
  }

  protected onScroll(): void {
    if (!this.isBrowser) return;
    const element = this.pane()?.nativeElement;
    if (!element) return;
    this.nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 48;
  }
}
