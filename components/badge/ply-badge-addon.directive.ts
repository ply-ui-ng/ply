import { Directive, ElementRef, Renderer2, AfterViewInit, inject, input } from '@angular/core';

/**
 * An addon element for a badge, typically used for small icons or indicators inside the badge.
 *
 * @example
 * <div ply-badge-addon color="primary" size="sm">
 *   <ply-icon name="x"></ply-icon>
 * </div>
 */
@Directive({
  selector: '[ply-badge-addon]',
})
export class BaseBadgeAddon implements AfterViewInit {
    private renderer = inject(Renderer2);
    private el = inject(ElementRef);

  /**
     * The color input property.
     * @example color="value"
     */
    readonly color = input<string | null>('primary');
  /**
     * The size input property.
     * @example size="value"
     */
    readonly size = input('md');
  /**
     * The width input property.
     * @example width="value"
     */
    readonly width = input('');

  ngAfterViewInit() {
    this.applyStyles();
  }

  private applyStyles() {
    let buttonClasses = 'w-4 h-4 rounded-md flex justify-center items-center ';

    const colorMap: Record<string, { button: string; icon: string }> = {
      'primary': { button: 'hover:bg-blue-600 active:bg-blue-700', icon: 'stroke-white' },
      'success': { button: 'hover:bg-green-600 active:bg-green-700', icon: 'stroke-white' },
      'danger': { button: 'hover:bg-red-600 active:bg-red-700', icon: 'stroke-white' },
      'warning': { button: 'hover:bg-orange-600 active:bg-orange-700', icon: 'stroke-white' },
      'accent': { button: 'hover:bg-purple-600 active:bg-purple-700', icon: 'stroke-white' },
      'primary-light': { button: 'hover:bg-blue-200 active:bg-blue-300', icon: 'stroke-blue-800' },
      'success-light': { button: 'hover:bg-green-200 active:bg-green-300', icon: 'stroke-green-800' },
      'danger-light': { button: 'hover:bg-red-200 active:bg-red-300', icon: 'stroke-red-800' },
      'warning-light': { button: 'hover:bg-orange-200 active:bg-orange-300', icon: 'stroke-orange-800' },
      'accent-light': { button: 'hover:bg-purple-200 active:bg-purple-300', icon: 'stroke-purple-800' },
    };

    const config = colorMap[this.color() ?? 'primary'] || colorMap['primary'];
    buttonClasses += config.button;
    let iconClasses = config.icon;

    switch (this.size()) {
      case 'sm':
        buttonClasses += ' h-4 w-4';
        iconClasses += ' w-3 h-3 min-w-3 max-w-3';
        break;
      case 'lg':
      case 'xl':
        buttonClasses += ' h-6 w-6';
        iconClasses += ' w-5 h-5 min-w-5 max-w-5';
        break;
      default:
        iconClasses += ' w-3 h-3 min-w-3 max-w-3';
    }

    const iconElement = this.el.nativeElement.querySelector('ply-icon');
    if (iconElement) {
      this.renderer.setAttribute(iconElement, 'class', iconClasses);
    }

    const buttonElement = this.el.nativeElement.querySelector('button');
    if (buttonElement) {
      buttonElement.className += ' ' + buttonClasses;
    }
  }
}
