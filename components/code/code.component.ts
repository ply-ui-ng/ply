import {
  Component,
  DOCUMENT,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  inject,
  input,
  model,
  viewChild,
  effect,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { buttonSlideRightToLeft, openClose } from '../animations/animations';
import { IconComponent } from '../icon/icon.component';
import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { ToastService } from '../toast/toast.service';
import { injectTimers } from '../safe-timer/safe-timer';

/**
 * A component to display formatted code blocks with syntax highlighting and a copy-to-clipboard button.
 * Supports HTML, TypeScript, JavaScript, and Bash highlighting.
 *
 * @example
 * <ply-code language="HTML" [showCode]="true">
 *   <div class="test">Hello World</div>
 * </ply-code>
 */
@Component({
  selector: 'ply-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, IconButtonDirective, ClipboardModule, TooltipDirective],
  templateUrl: './code.component.html',
  animations: [buttonSlideRightToLeft, openClose],
  host: { class: 'block not-prose' },
})
export class CodeComponent implements OnDestroy {
  /** Timers cancelled automatically on destroy — see utils/safe-timer. */
  private readonly timers = injectTimers();
  private readonly document = inject(DOCUMENT);

  /** The programming language of the code (e.g., 'HTML', 'TypeScript', 'Bash'). Used for syntax highlighting. */
  readonly language = input('');

  /** If true, the code block is expanded and visible by default. If false, it starts collapsed. */
  readonly showCode = model(false);

  readonly contentRef = viewChild<ElementRef>('content');

  /** Tooltip label for the copy button; flips to "Copied" after a successful copy. */
  readonly copyTooltip = signal('Copy to clipboard');

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * Highlighting must not destroy the projected `<pre>`: live snippets
   * (the docs playground) re-render their text on every knob change, and a
   * detached node would freeze the block on its first paint. The source stays
   * in the DOM hidden, and the coloured copy lives in a sibling element.
   */
  private observer: MutationObserver | null = null;
  private observedEl: HTMLElement | null = null;
  private lastSourceText: string | null = null;

  constructor() {
    effect(() => {
      const el = this.contentRef();
      // Highlighting is a browser-only visual enhancement: it reads `dataset`
      // and writes DOM, neither of which is meaningful during server render.
      if (el && this.isBrowser) {
        this.timers.setTimeout(() => this.highlight());
      }
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private clipboard = inject(Clipboard);
  private toastService = inject(ToastService);

  /** The projected code element, or null once highlighting has taken over. */
  private sourceElement(el: HTMLElement): HTMLElement | null {
    return el.querySelector('pre:not([data-ply-code-highlighted])');
  }

  highlight() {
    if (!this.isBrowser) return;
    const content = this.contentRef();
    if (!content) return;
    const el = content.nativeElement as HTMLElement;

    // Toggling `showCode` recreates the content element, so identity — not just
    // text — decides whether a repaint is needed.
    if (this.observedEl !== el) {
      this.observedEl = el;
      this.lastSourceText = null;
      this.observer?.disconnect();
      this.observer = null;
    }

    const source = this.sourceElement(el);
    const text = source ? source.textContent || '' : el.textContent || '';
    if (text === this.lastSourceText) return;
    this.lastSourceText = text;

    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    if (this.language().toLowerCase().includes('html')) {
      // Highlight HTML attributes
      html = html.replace(
        /([a-zA-Z-]+)=(&quot;|"|')(.*?)\2/g,
        '<span class="text-slate-600 dark:text-slate-400">$1</span>=$2<span class="text-cyan-700 dark:text-cyan-400">$3</span>$2',
      );
      // Highlight HTML tags and their opening brackets
      html = html.replace(
        /(&lt;\/?)([a-zA-Z0-9-]+)/g,
        '<span class="text-slate-600 dark:text-slate-400">$1</span><span class="text-pink-700 dark:text-pink-400">$2</span>',
      );
      // Highlight closing brackets
      html = html.replace(/(\/?&gt;)/g, '<span class="text-slate-600 dark:text-slate-400">$1</span>');
    } else if (
      this.language().toLowerCase().includes('typescript') ||
      this.language().toLowerCase().includes('javascript')
    ) {
      // Extract strings first to avoid messing up injected HTML later
      const strings: string[] = [];
      html = html.replace(/(&quot;|"|')(.*?)\1/g, (match: string) => {
        strings.push(match);
        return `__STR_${strings.length - 1}__`;
      });

      // Highlight keywords
      html = html.replace(
        /\b(import|export|from|class|const|let|var|function|return|if|else|switch|case|default|break|continue|new|try|catch|finally|throw|typeof|instanceof|void|delete|in|of|yield|await|async|implements|interface|extends)\b/g,
        '<span class="text-pink-700 dark:text-pink-400">$1</span>',
      );

      // Restore strings with highlight
      html = html.replace(/__STR_(\d+)__/g, (_match: string, indexStr: string) => {
        const index = parseInt(indexStr, 10);
        return `<span class="text-cyan-700 dark:text-cyan-400">${strings[index]}</span>`;
      });
    } else if (this.language().toLowerCase().includes('bash') || this.language().toLowerCase().includes('sh')) {
      // Highlight common bash commands
      html = html.replace(/^(npm|ng|npx|node|git|cd|ls|mkdir|rm|cp|mv)\b/gm, '<span class="text-pink-700 dark:text-pink-400">$1</span>');
    }

    // Render the coloured copy into a sibling so the projected `<pre>` stays
    // attached and keeps receiving live text updates.
    let target = el.querySelector('pre[data-ply-code-highlighted]') as HTMLElement | null;
    if (!target) {
      target = this.document.createElement('pre');
      target.setAttribute('data-ply-code-highlighted', 'true');
      target.className = 'm-0! p-0! bg-transparent! text-inherit! font-inherit whitespace-pre-wrap';
      el.appendChild(target);
    }
    if (source) source.style.display = 'none';
    target.innerHTML = html;
    el.dataset.highlighted = 'true';
    this.watch(el);
  }

  /** Repaints when the projected code text changes underneath us. */
  private watch(el: HTMLElement): void {
    if (this.observer || typeof MutationObserver === 'undefined') return;
    this.observer = new MutationObserver(() => {
      const source = this.sourceElement(el);
      const text = source ? source.textContent || '' : '';
      if (text !== this.lastSourceText) this.timers.setTimeout(() => this.highlight(), 0);
    });
    this.observer.observe(el, { childList: true, characterData: true, subtree: true });
  }

  show() {
    this.showCode.set(!this.showCode());
  }

  copyTo() {
    const content = this.contentRef();
    if (!content) return;
    const el = content.nativeElement as HTMLElement;
    const source = this.sourceElement(el);
    const text = source ? source.textContent || '' : el.innerText;
    this.clipboard.copy(text);
    this.copyTooltip.set('Copied');
    this.toastService.success('Code copied to clipboard!');
  }

  resetCopyTooltip() {
    this.copyTooltip.set('Copy to clipboard');
  }
}
