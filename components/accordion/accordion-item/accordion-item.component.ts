import { Component, computed, input, model, output, ChangeDetectionStrategy, booleanAttribute } from '@angular/core';

import { IconComponent } from '../../icon/icon.component';
import { cn } from '../../tw-merge/tw-merge';

let accordionItemIdCounter = 0;

/**
 * A single item within a ply-accordion containing a header and body.
 *
 * @example
 * <ply-accordion-item>
 *   <ply-accordion-item-header>Header</ply-accordion-item-header>
 *   <ply-accordion-item-body>Body</ply-accordion-item-body>
 * </ply-accordion-item>
 */
@Component({
  selector: 'ply-accordion-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './accordion-item.component.html',
  host: { '[class]': 'hostCls()' },
})
export class AccordionItemComponent {
  readonly extraClass = input('', { alias: 'class' });

  /** Two-way bindable open state — parent accordion can close it via item.isOpen.set(false). */
  readonly isOpen = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emitted when the item is toggled. Carries the new open state. */
  readonly toggled = output<boolean>();

  readonly headerId = `ply-accordion-header-${accordionItemIdCounter}`;
  readonly panelId = `ply-accordion-panel-${accordionItemIdCounter++}`;

  protected readonly hostCls = computed(() =>
    cn(
      'flex flex-col h-auto w-full overflow-hidden border-b border-slate-300 dark:border-slate-700 dark:text-slate-200 last-of-type:border-b-0',
      this.disabled() && 'cursor-not-allowed pointer-events-none opacity-50',
      this.extraClass()
    )
  );

  readonly headerButtonClass = computed(() =>
    cn(
      'h-14 w-full flex items-center justify-between px-4 border-slate-300 -mt-px dark:border-slate-700! hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer last-of-type:border-0 text-left bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500',
      this.isOpen()
        ? 'bg-slate-100 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-900 border-b'
        : 'border-b-0'
    )
  );

  toggle(): void {
    if (!this.disabled()) {
      this.isOpen.update((v) => !v);
      this.toggled.emit(this.isOpen());
    }
  }
}
