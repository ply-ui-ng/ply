import { Component,
  ElementRef,
  OnDestroy,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';

import { outputToObservable } from '@angular/core/rxjs-interop';
import { AccordionItemComponent } from './accordion-item/accordion-item.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { cn } from '../tw-merge/tw-merge';

/**
 * A container component for accordion items.
 *
 * @example
 * <ply-accordion [multi]="false">
 *   <ply-accordion-item>...</ply-accordion-item>
 * </ply-accordion>
 */
@Component({
  selector: 'ply-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './accordion.component.html',
  host: { '[class]': 'hostCls()', '(keydown)': 'onHostKeydown($event)' }
})
export class AccordionComponent implements OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);

  readonly extraClass = input('', { alias: 'class' });
  readonly multi = input(false, { transform: booleanAttribute });

  readonly items = contentChildren(AccordionItemComponent);

  protected readonly hostCls = computed(() =>
    cn(
      'overflow-hidden flex flex-col rounded-xl border border-slate-300 dark:border-slate-700',
      this.extraClass()
    )
  );

  private itemDestroy$ = new Subject<void>();

  constructor() {
    effect(() => {
      const items = this.items();
      this.setupItems(items);
    });
  }

  private setupItems(items: readonly AccordionItemComponent[]) {
    this.itemDestroy$.next();
    items.forEach(item => {
      // outputToObservable converts OutputEmitterRef → Observable so we can use rxjs operators
      outputToObservable(item.toggled)
        .pipe(takeUntil(this.itemDestroy$))
        .subscribe(isOpen => {
          if (isOpen && !this.multi()) this.closeAllExcept(item);
        });
    });
  }

  /**
   * WAI-ARIA accordion keyboard pattern: arrow keys move focus between header
   * buttons, Home/End jump to the first/last item.
   */
  onHostKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;

    const headers = Array.from(
      this.elementRef.nativeElement.querySelectorAll('button[aria-expanded]')
    ) as HTMLButtonElement[];
    if (!headers.length) return;

    const current = this.document.activeElement as HTMLButtonElement | null;
    const index = headers.indexOf(current!);
    let next = 0;
    if (key === 'ArrowDown') next = index < 0 ? 0 : (index + 1) % headers.length;
    if (key === 'ArrowUp') next = index < 0 ? headers.length - 1 : (index - 1 + headers.length) % headers.length;
    if (key === 'Home') next = 0;
    if (key === 'End') next = headers.length - 1;

    event.preventDefault();
    headers[next].focus();
  }

  closeAllExcept(exceptItem: AccordionItemComponent): void {
    this.items().forEach(item => {
      if (item !== exceptItem) item.isOpen.set(false);
    });
  }

  ngOnDestroy() {
    this.itemDestroy$.next();
    this.itemDestroy$.complete();
  }
}
