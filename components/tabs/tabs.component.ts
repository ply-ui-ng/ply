import { Component, HostListener, OnChanges, SimpleChanges, computed, contentChildren, effect, input, output, viewChild, ElementRef, signal,
  ChangeDetectionStrategy, booleanAttribute, inject} from '@angular/core';
import { NgTemplateOutlet, DOCUMENT } from '@angular/common';
import { TabComponent } from './tab/tab.component';
import { IconComponent } from '../icon/icon.component';
import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { cn, FOCUS_RING } from '../tw-merge/tw-merge';
import { injectTimers } from '../safe-timer/safe-timer';

/**
 * A container component for rendering tabbed navigation and content.
 *
 * @example
 * <ply-tabs [defaultTab]="1">
 *   <ply-tab label="Overview"><ply-tab-body>Content</ply-tab-body></ply-tab>
 * </ply-tabs>
 */
@Component({
  selector: 'ply-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, IconComponent, IconButtonDirective],
  templateUrl: './tabs.component.html',
  host: { '[class]': 'hostCls()' }
})
export class TabsComponent implements OnChanges {
  /** Timers cancelled automatically on destroy — see utils/safe-timer. */
  private readonly timers = injectTimers();
  private readonly ssrDocument = inject(DOCUMENT);

  readonly extraClass      = input('', { alias: 'class' });
  readonly defaultTab      = input(0);
  readonly type            = input<string | undefined>(undefined);
  readonly position        = input<string | undefined>(undefined);
  readonly icon            = input<string | undefined>(undefined);
  readonly scrollRestricted = input(false, { transform: booleanAttribute });

  /** Accessible name for the tab list when a visible label is not present elsewhere. */
  readonly ariaLabel = input('');

  /** ID of an external element that labels this tab list. */
  readonly labelledBy = input('');

  /** Emitted whenever the active tab changes. */
  readonly tabChanged = output<TabComponent>();

  readonly tabs            = contentChildren(TabComponent);
  readonly tabListContainer = viewChild<ElementRef<HTMLDivElement>>('tabListContainer');

  protected readonly hostCls = computed(() => cn('block', this.extraClass()));

  readonly containerClass = computed(() => cn(
    'flex justify-start overflow-x-auto scroll-smooth hide-scrollbar flex-1 pb-px scrollbar-none [&::-webkit-scrollbar]:hidden',
    this.type() === 'underline' && 'border-b border-slate-300 dark:border-slate-700',
    this.type() === 'folder' && 'bg-slate-100 dark:bg-slate-900 rounded-t-lg pt-1 px-1',
    this.position() === 'left' && 'justify-start!',
    this.position() === 'center' && 'justify-center!',
    this.position() === 'right' && 'justify-end!'
  ));

  readonly activeTab = signal<TabComponent | undefined>(undefined);
  readonly showLeftArrow = signal(false);
  readonly showRightArrow = signal(false);

  constructor() {
    effect(() => {
      const tabs = this.tabs();
      if (tabs.length > 0 && !this.activeTab()) {
        // Effect-driven selection: skip the output so consumers don't receive
        // an emission from inside the effect (it would run their handlers in
        // the effect's execution context).
        this.selectTab(tabs[this.defaultTab()] ?? tabs[0], false, false);
      }
      this.timers.setTimeout(() => this.checkOverflow(), 0);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultTab'] && !changes['defaultTab'].firstChange) {
      const tabs = this.tabs();
      if (tabs.length) this.selectTab(tabs[this.defaultTab()] ?? tabs[0]);
    }
  }

  @HostListener('window:resize')
  onResize() { this.checkOverflow(); }

  checkOverflow() {
    const container = this.tabListContainer()?.nativeElement;
    if (!container) return;
    this.showLeftArrow.set(container.scrollLeft > 1);
    this.showRightArrow.set(Math.ceil(container.scrollLeft + container.clientWidth) < container.scrollWidth - 1);
  }

  scrollTabs(dir: 'left' | 'right') {
    const container = this.tabListContainer()?.nativeElement;
    if (!container) return;
    container.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    this.timers.setTimeout(() => this.checkOverflow(), 300);
  }

  selectTab(tabItem: TabComponent, focusTab = false, notify = true) {
    if (!tabItem || this.activeTab() === tabItem) return;
    if (this.activeTab()) {
      this.activeTab()!.isActive.set(false);
      const labelComponent = this.activeTab()!.labelComponent();
      if (labelComponent) labelComponent.isActive.set(false);
    }
    this.activeTab.set(tabItem);
    tabItem.isActive.set(true);
    const labelComponent = tabItem.labelComponent();
    if (labelComponent) {
      labelComponent.isActive.set(true);
      labelComponent.type.set(this.type());
    }
    if (notify) {
      this.tabChanged.emit(tabItem);
    }
    if (focusTab) {
      this.focusTab(tabItem);
    }
  }

  onTabListKeydown(event: KeyboardEvent): void {
    const tabItems = this.tabs();
    const current = this.activeTab();
    if (!tabItems.length || !current) return;

    const currentIndex = tabItems.indexOf(current);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    let handled = true;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % tabItems.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + tabItems.length) % tabItems.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabItems.length - 1;
        break;
      default:
        handled = false;
        break;
    }

    if (!handled) return;

    event.preventDefault();
    this.selectTab(tabItems[nextIndex], true);
    this.scrollTabIntoView(tabItems[nextIndex]);
  }

  private focusTab(tabItem: TabComponent): void {
    this.timers.setTimeout(() => this.ssrDocument.getElementById(tabItem.tabId)?.focus());
  }

  private scrollTabIntoView(tabItem: TabComponent): void {
    this.timers.setTimeout(() =>
      this.ssrDocument.getElementById(tabItem.tabId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      })
    );
  }

  getTabClass(item: TabComponent) {
    return cn(
      'px-8 h-10 flex items-center text-sm bg-transparent whitespace-nowrap dark:text-slate-400 border-0',
      FOCUS_RING,
      item.tabClass(),
      this.type() === 'underline' && 'hover:shadow-tab',
      this.activeTab() === item &&
        this.type() === 'underline' &&
        'text-[var(--ply-primary)]! shadow-[0_1px_0_var(--ply-primary)] hover:shadow-[0_1px_0_var(--ply-primary)] bg-transparent',
      this.type() === 'pills' &&
        'bg-slate-100 dark:bg-slate-600 dark:text-slate-200 rounded-md! mr-2 last-of-type:mr-0 transition-color duration-300',
      this.activeTab() === item &&
        this.type() === 'pills' &&
        'text-[var(--ply-primary-foreground)]! bg-[var(--ply-primary)]! rounded-md',
      this.activeTab() === item &&
        this.type() === 'folder' &&
        'bg-white dark:bg-slate-800 text-[var(--ply-primary)] rounded-t-md',
      this.position() === 'full-width' && 'flex-1 justify-center'
    );
  }
}
