import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ScrollNavItemDirective } from './scroll-nav-item.directive';
import { ScrollNavContentComponent } from './scroll-nav-content/scroll-nav-content.component';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { cn } from '../tw-merge/tw-merge';
import { injectTimers } from '../safe-timer/safe-timer';

/** Offset from the top of the content pane used to pick the active section. */
const ACTIVATION_OFFSET_PX = 48;

/**
 * Docs/layout shell: one scrollport with a sticky TOC sidebar.
 * Scroll lives on this host; `ply-scroll-nav-sidebar` sticks to the top.
 *
 * @example
 * <ply-scroll-nav>
 *   <ply-scroll-nav-content>...</ply-scroll-nav-content>
 *   <ply-scroll-nav-sidebar>...</ply-scroll-nav-sidebar>
 * </ply-scroll-nav>
 */
@Component({
  selector: 'ply-scroll-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './scroll-nav.component.html',
  host: { '[class]': 'hostCls()' }
})
export class ScrollNavComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() =>
    cn(
      'relative flex h-full min-h-0 w-full items-start overflow-x-hidden overflow-y-auto',
      this.extraClass(),
    ),
  );

  readonly container = contentChild(ScrollNavContentComponent, { read: ElementRef });
  readonly items = contentChildren(ScrollNavItemDirective, { descendants: true });

  public readonly percentage = signal(0);
  private itemsDestroy$ = new Subject<void>();
  private selectedItem?: ScrollNavItemDirective;
  private boundScrollElements = new WeakSet<HTMLElement>();
  private windowResizeBound = false;
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  /** Timers cancelled automatically on destroy — see utils/safe-timer. */
  private readonly timers = injectTimers();
  private initRaf?: number;
  private tempScrollCleanup?: () => void;
  private tempScrollTimer?: ReturnType<typeof setTimeout>;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.initialize();
    this.initRaf = requestAnimationFrame(() => this.initialize());
  }

  private initialize() {
    this.setupItemListeners();
    this.bindScrollListeners();
    this.updateActiveItem();
  }

  private setupItemListeners() {
    this.itemsDestroy$.next();
    this.itemsDestroy$.complete();
    this.itemsDestroy$ = new Subject<void>();
    this.items().forEach(item => {
      outputToObservable(item.clicked)
        .pipe(takeUntil(this.itemsDestroy$))
        .subscribe(() => this.scrollTo(item.elementId()));
    });
  }

  private bindScrollListeners() {
    for (const el of this.resolveScrollElements()) {
      if (this.boundScrollElements.has(el)) continue;
      this.boundScrollElements.add(el);
      fromEvent(el, 'scroll')
        .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(10))
        .subscribe(() => this.updateActiveItem());
    }

    if (!this.windowResizeBound) {
      this.windowResizeBound = true;
      fromEvent(window, 'resize')
        .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(50))
        .subscribe(() => {
          this.bindScrollListeners();
          this.updateActiveItem();
        });
    }
  }

  ngOnDestroy() {
    this.itemsDestroy$.next();
    this.itemsDestroy$.complete();
    if (this.initRaf !== undefined) {
      cancelAnimationFrame(this.initRaf);
    }
    this.tempScrollCleanup?.();
  }

  /**
   * Prefer this host as the scrollport; fall back to scrollable ancestors when
   * the host is not height-constrained (e.g. page layouts that scroll outside).
   */
  private resolveScrollElements(): HTMLElement[] {
    const hostEl = this.host.nativeElement;
    const elements: HTMLElement[] = [];

    if (hostEl.scrollHeight > hostEl.clientHeight + 1) {
      elements.push(hostEl);
    }

    let node: HTMLElement | null = hostEl.parentElement;
    while (node && node !== document.documentElement) {
      const { overflowY } = getComputedStyle(node);
      if (
        (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
        node.scrollHeight > node.clientHeight + 1
      ) {
        elements.push(node);
      }
      node = node.parentElement;
    }

    if (elements.length === 0) {
      elements.push(hostEl);
    }

    return elements;
  }

  private getPrimaryScrollElement(): HTMLElement {
    const scrollables = this.resolveScrollElements();
    const scrolling = scrollables.filter(el => el.scrollTop > 0);
    if (scrolling.length > 0) {
      return scrolling[0];
    }
    return scrollables.length > 1 ? scrollables[scrollables.length - 1] : scrollables[0];
  }

  private getSectionElement(containerEl: HTMLElement, id: string): HTMLElement | null {
    if (!id) return null;
    return containerEl.querySelector(`#${CSS.escape(id)}`);
  }

  private updateActiveItem() {
    const containerEl = this.container()?.nativeElement as HTMLElement | undefined;
    const navItems = this.items();
    if (!containerEl || navItems.length === 0) return;

    const scrollEl = this.getPrimaryScrollElement();
    const { scrollTop, scrollHeight, clientHeight } = scrollEl;
    const scrollable = scrollHeight - clientHeight > 1;
    this.percentage.set(scrollable ? scrollTop / (scrollHeight - clientHeight) : 0);

    const activationY = scrollEl.getBoundingClientRect().top + ACTIVATION_OFFSET_PX;
    let activeItem: ScrollNavItemDirective | undefined;

    if (scrollable && scrollTop + clientHeight >= scrollHeight - 2) {
      activeItem = navItems.at(-1);
    } else {
      for (const item of navItems) {
        const element = this.getSectionElement(containerEl, item.elementId());
        if (!element) continue;
        if (element.getBoundingClientRect().top <= activationY) {
          activeItem = item;
        }
      }
      if (!activeItem) {
        activeItem = navItems[0];
      }
    }

    this.setActiveItem(activeItem);
  }

  private setActiveItem(activeItem: ScrollNavItemDirective | undefined) {
    if (!activeItem) return;
    if (this.selectedItem === activeItem) {
      if (!activeItem.isActive()) {
        activeItem.isActive.set(true);
      }
      return;
    }
    this.selectedItem?.isActive.set(false);
    this.selectedItem = activeItem;
    activeItem.isActive.set(true);
  }

  private scrollTo(id: string) {
    const containerEl = this.container()?.nativeElement as HTMLElement | undefined;
    const el = containerEl ? this.getSectionElement(containerEl, id) : null;
    if (!containerEl || !el) return;

    const scrollEl = this.getPrimaryScrollElement();
    const top =
      el.getBoundingClientRect().top -
      scrollEl.getBoundingClientRect().top +
      scrollEl.scrollTop -
      12;

    scrollEl.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

    const syncActive = () => this.updateActiveItem();
    this.tempScrollCleanup?.();
    this.timers.clear(this.tempScrollTimer);
    scrollEl.addEventListener('scroll', syncActive, { passive: true });
    this.tempScrollCleanup = () => {
      scrollEl.removeEventListener('scroll', syncActive);
      this.tempScrollCleanup = undefined;
    };
    this.tempScrollTimer = this.timers.setTimeout(() => {
      this.tempScrollCleanup?.();
      syncActive();
    }, 800);
  }
}
