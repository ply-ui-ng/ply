import { Directive, ElementRef, Renderer2, OnInit, inject, input } from '@angular/core';

/**
 * Static class maps instead of `` bg-${color}-500 `` interpolation: Tailwind's
 * scanner only sees complete class names in source, so interpolated classes
 * are never generated in the CSS.
 */
const COLOR_CLASSES: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  gray: 'bg-gray-500',
  indigo: 'bg-indigo-500',
  pink: 'bg-pink-500',
};

const SIZE_CLASSES: Record<string, string> = {
  '12': 'h-3 w-3',
  '16': 'h-4 w-4',
  '20': 'h-5 w-5',
  '24': 'h-6 w-6',
  '28': 'h-7 w-7',
  '32': 'h-8 w-8',
};

/**
 * Applies badge styling to an icon.
 * 
 * @example
 * <ply-icon ply-badge-icon color="danger" size="md" name="bell"></ply-icon>
 */
@Directive({
  selector: '[badge-icon]',
})
export class BaseBadgeIconDirective implements OnInit {
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);

  /** Tailwind color name (e.g., 'red', 'blue', 'green'). Defaults to 'red'. */
  readonly color = input<'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray' | 'indigo' | 'pink' | string>();
  
  /** Numeric Tailwind spacing size for width and height (e.g., '16', '24'). Defaults to '16'. */
  readonly size = input<'12' | '16' | '20' | '24' | '28' | '32' | string>();

  ngOnInit() {
    const icon = this.el.nativeElement.classList;
    icon.add('absolute', '-top-2', '-end-2');

    const colorClass = COLOR_CLASSES[this.color() ?? ''] ?? 'bg-red-500';
    this.renderer.addClass(this.el.nativeElement, colorClass);

    const sizeClasses = SIZE_CLASSES[this.size() ?? ''] ?? 'h-4 w-4';
    for (const cls of sizeClasses.split(' ')) {
      this.renderer.addClass(this.el.nativeElement, cls);
    }

    this.renderer.addClass(this.el.nativeElement, 'rounded-full');
    this.renderer.addClass(this.el.nativeElement, 'border-2');
    this.renderer.addClass(this.el.nativeElement, 'border-white');
    this.renderer.addClass(this.el.nativeElement, 'dark:border-slate-900');
  }
}
