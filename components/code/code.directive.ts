import { Directive, ElementRef, Renderer2, OnInit, inject } from '@angular/core';

/**
 * A stylistic directive that applies monospace font and code-block styling to inline elements.
 * 
 * @example
 * Please run the <span code>npm install</span> command.
 */
@Directive({
  selector: '[code]',
})
export class CodeDirective implements OnInit {
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);


  ngOnInit() {
    // Add via addClass so classes the consumer put on the element are kept.
    const classes =
      'bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-300 px-1.5 py-0.5 rounded text-sm font-mono';
    for (const cls of classes.split(' ')) {
      this.renderer.addClass(this.el.nativeElement, cls);
    }
  }
}
