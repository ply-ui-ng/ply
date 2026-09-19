import { Directive, ElementRef, OnInit, Renderer2, inject } from '@angular/core';

/**
 * A stylistic directive that applies standardized padding, height, and hover effects
 * for an item within a generic list view.
 * 
 * @example
 * <ul>
 *   <li ply-list-item>Item 1</li>
 * </ul>
 */
@Directive({
  selector: '[ply-list-item]',
})
export class BaseListItemDirective implements OnInit {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);


  ngOnInit() {
    const el = this.el.nativeElement as HTMLElement;
    const classes = [
      'text-slate-500',
      'cursor-pointer',
      'dark:text-slate-300',
      'hover:text-blue-600',
      'dark:hover:text-blue-600',
      'text-sm',
      'h-10',
      'flex',
      'items-center',
      'justify-between',
      'transition-colors',
      'duration-300',
      'font-medium',
      'w-full'
    ];

    classes.forEach((cls) => this.renderer.addClass(el, cls));
  }
}
