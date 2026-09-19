import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  viewChild,
  ViewContainerRef,
  inject,
  ChangeDetectionStrategy, PLATFORM_ID} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { animate, style, transition, trigger, animateChild, query } from '@angular/animations';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { DialogContainer } from '../dialog-container';
import { DialogContext } from '../dialog-context';
import { BASE_UI_I18N } from '../../i18n/i18n';

let dialogLabelIdCounter = 0;

/**
 * Internal container component that renders the dialog overlay and handles click-outside behavior.
 * Created dynamically by `DialogService`.
 */
@Component({
  selector: 'ply-dialog-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './dialog-container.component.html',
  animations: [
    trigger('host', [
      transition(':leave', [query('@backdrop,@box', [animateChild()], { optional: true })]),
      transition(':enter', [query('@backdrop,@box', [animateChild()], { optional: true })]),
    ]),
    trigger('box', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1.05)', opacity: 1 })),
        animate('100ms ease-out', style({ transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ transform: 'scale(1.05)' })),
        animate('200ms ease-in', style({ transform: 'scale(0.5)', opacity: 0 })),
      ]),
    ]),
    trigger('backdrop', [
      transition(':enter', [style({ opacity: 0 }), animate('230ms ease-in', style({ opacity: 1 }))]),
      transition(':leave', [animate('230ms ease-out', style({ opacity: 0 }))]),
    ]),
  ],
  host: { '[@host]': 'true' },
})
export class DialogContainerComponent implements DialogContainer, AfterViewInit, OnDestroy {
  /** Browser-only DOM work below; prerendering runs these hooks too. */
  private readonly isSsrSafeBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  className = '';

  readonly container = viewChild.required('container', { read: ViewContainerRef });
  readonly dialogBox = viewChild<ElementRef<HTMLElement>>('dialogBox');

  context!: DialogContext<unknown, unknown>;

  readonly dialogLabelId = `ply-dialog-label-${dialogLabelIdCounter++}`;

  private focusTrap?: FocusTrap;
  private previouslyFocused: HTMLElement | null = null;
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private focusTrapFactory = inject(FocusTrapFactory);
  private readonly i18n = inject(BASE_UI_I18N);

  ngAfterViewInit(): void {
    if (!this.isSsrSafeBrowser) return;
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    this.focusTrap = this.focusTrapFactory.create(this.elementRef.nativeElement);
    this.focusTrap.focusInitialElementWhenReady();
    this.applyDialogLabelling();
  }

  ngOnDestroy(): void {
    this.focusTrap?.destroy();
    this.previouslyFocused?.focus();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.context?.close();
  }

  applyDialogLabelling(): void {
    const box = this.dialogBox()?.nativeElement;
    if (!box) return;

    const heading =
      box.querySelector('h1, h2, h3') ??
      box.querySelector('[ply-dialog-header], ply-dialog-header');
    if (heading instanceof HTMLElement) {
      if (!heading.id) {
        heading.id = this.dialogLabelId;
      }
      box.setAttribute('aria-labelledby', heading.id);
      box.removeAttribute('aria-label');
    } else {
      box.setAttribute('aria-label', this.i18n.dialog);
      box.removeAttribute('aria-labelledby');
    }
  }
}
