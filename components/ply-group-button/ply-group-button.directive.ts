import { Directive, Renderer2, ElementRef, OnInit, inject, input } from '@angular/core';
import { GroupButtonColor, GroupButtonSize } from "../types";

/**
 * A standard group button directive applying Lussos theme styles.
 * 
 * @example
 * <button ply-group-button color="primary" size="lg">Button</button>
 */
@Directive({
    selector: '[ply-group-button]',
})
export class BaseGroupButtonDirective implements OnInit {
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);

  /** The semantic visual color. Defaults to 'default'. */
  readonly color = input<GroupButtonColor | string>('default');
  
  /** The size of the group button. Defaults to 'default'. */
  readonly size = input<GroupButtonSize | string>('default');
  
  /** Optional custom width (e.g. '100%'). */
  readonly width = input<string>('');
  ngOnInit(): void {
    let classes: string;
    let iconClass: string;
    const button_default =
      'flex items-center gap-2 relative text-center justify-center tracking-wide disabled:pointer-events-none';
    switch (this.color()) {
      case 'primary':
        classes =
          'text-white bg-blue-500 hover:bg-blue-700 active:bg-blue-900 disabled:hover:bg-blue-500 disabled:cursor-not-allowed  disabled:opacity-50';
        iconClass = 'stroke-white';
        break;
      case 'success':
        classes =
          'text-white bg-green-500 hover:bg-green-700 active:bg-green-900  disabled:hover:bg-green-500 disabled:cursor-not-allowed  disabled:opacity-50';
        iconClass = 'stroke-white';
        break;
      case 'danger':
        classes =
          'text-white bg-red-500 hover:bg-red-700 active:bg-red-900 disabled:hover:bg-red-500 disabled:cursor-not-allowed  disabled:opacity-50';
        iconClass = 'stroke-white';
        break;
      case 'warning':
        classes =
          'text-white bg-orange-500 hover:bg-orange-700 active:bg-orange-900 disabled:hover:bg-orange-500 disabled:cursor-not-allowed  disabled:opacity-50';
        iconClass = 'stroke-white';
        break;
      case 'accent':
        classes =
          'text-white bg-purple-500 hover:bg-purple-700 active:bg-purple-900 disabled:hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50';
        iconClass = 'stroke-white';
        break;
      case 'transparent':
        classes =
          'text-slate-800 dark:text-slate-300 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 dark:active:hover:bg-slate-600 border-e border-slate-200 dark:border-slate-700 last-of-type:border-0 disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-50';
        iconClass = 'stroke-slate-800 dark:stroke-slate-300';
        break;
      default:
        classes =
          'text-slate-800 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-200 active:bg-slate-500 dark:active:bg-slate-600 disabled:hover:bg-slate-200 dark:disabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50';
        iconClass = 'stroke-slate-800 dark:stroke-slate-300';
    }
    switch (this.size()) {
      case 'sm':
        classes = classes + ' h-7 text-xs px-4';
        iconClass = iconClass + ' w-3 h-3';
        break;
      case 'lg':
        classes = classes + ' h-10 text-base px-7';
        iconClass = iconClass + ' w-6 h-6';
        break;
      case 'xl':
        classes = classes + ' h-11 text-base px-8';
        iconClass = iconClass + ' w-6 h-6';
        break;
      case 'xxl':
        classes = classes + ' h-14 text-lg px-10';
        iconClass = iconClass + ' w-7 h-7';
        break;
      default:
        classes = classes + ' h-9 text-sm px-6';
        iconClass = iconClass + ' w-5 h-5';
    }
    this.renderer.setAttribute(
      this.el.nativeElement,
      'class',
      classes + ' ' + button_default + ' ' + this.width()
    );
    const iconElement = this.el.nativeElement.querySelector('ply-icon');

    if (iconElement) {
      this.renderer.setAttribute(iconElement, 'class', iconClass);
    }
  }
}
