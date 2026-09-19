import { Directive, ElementRef, OnInit, Renderer2, inject, input } from '@angular/core';

/**
 * A structural directive that styles a `<ply-icon>` projected inside a `ply-tab-label`.
 * Automatically applies the correct sizing and stroke colors.
 * 
 * @example
 * <ply-tab-label>
 *   <ply-icon plyTabIcon name="home"></ply-icon> Home
 * </ply-tab-label>
 */
@Directive({
  selector: '[plyTabIcon]',
})
export class BaseTabIconDirective implements OnInit {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  /** Optional variant type for the icon style. */
  readonly type = input('default');

  ngOnInit(): void {
    const iconElement = this.el.nativeElement.querySelector('ply-icon');

    if (iconElement) {
      this.renderer.addClass(iconElement, 'w-5');
      this.renderer.addClass(iconElement, 'h-5');
      this.renderer.addClass(iconElement, 'stroke-slate-700');
      this.renderer.addClass(iconElement, 'dark:stroke-slate-100');
    }
  }
}
