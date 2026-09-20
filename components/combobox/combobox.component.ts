import {
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  ChangeDetectionStrategy,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  contentChild,
} from '@angular/core';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComboboxOption } from '../types';
import { cn, PRIMARY_SOFT } from '../tw-merge/tw-merge';
import { BASE_UI_I18N } from '../i18n/i18n';
import { IconComponent } from '../icon/icon.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { ComboboxOptionDirective } from './combobox-option.directive';

let comboboxIdCounter = 0;

/**
 * Searchable combobox with keyboard navigation, optional create, Angular Forms CVA,
 * and an optional `plyComboboxOption` option template.
 *
 * @example
 * <ply-combobox [(ngModel)]="userId" [options]="users" placeholder="Search users…">
 *   <ng-template plyComboboxOption let-option>
 *     <span>{{ option.label }}</span>
 *   </ng-template>
 * </ply-combobox>
 */
@Component({
  selector: 'ply-combobox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconComponent, SpinnerComponent, NgTemplateOutlet],
  templateUrl: './combobox.component.html',
  host: {
    '[class]': 'hostCls()',
    '(document:click)': 'handleClickOutside($event)',
  },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ComboboxComponent), multi: true },
  ],
})
export class ComboboxComponent implements ControlValueAccessor, OnDestroy {
  private readonly isSsrSafeBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly el = inject(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  protected readonly i18n = inject(BASE_UI_I18N);

  private static readonly PANEL_POSITIONS: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  ];

  /**
   * Additional host classes.
   * @example
   * <ply-combobox class="w-72" [options]="people"></ply-combobox>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Visible label above the field.
   * @example
   * <ply-combobox label="Assignee" [options]="people"></ply-combobox>
   */
  readonly label = input('');

  /**
   * Placeholder when nothing is selected.
   * @example
   * <ply-combobox placeholder="Search…" [options]="items"></ply-combobox>
   */
  readonly placeholder = input('Search…');

  /**
   * Options shown in the listbox. Override the row with `<ng-template plyComboboxOption>`.
   * @example
   * <ply-combobox [options]="[{ value: 'a', label: 'Alpha' }]"></ply-combobox>
   */
  readonly options = input<ComboboxOption[]>([]);

  /**
   * `local` filters by label; `none` shows `options` as-is (use with `queryChange` for async search).
   * @example
   * <ply-combobox filterMode="none" (queryChange)="search($event)" [options]="results"></ply-combobox>
   */
  readonly filterMode = input<'local' | 'none'>('local');

  /**
   * Shows a spinner in the panel (async search).
   * @example
   * <ply-combobox [loading]="isSearching" [options]="results"></ply-combobox>
   */
  readonly loading = input(false, { transform: booleanAttribute });

  /**
   * Allows creating the current query when it matches no option.
   * @example
   * <ply-combobox [allowCreate]="true" (create)="addTag($event)" [options]="tags"></ply-combobox>
   */
  readonly allowCreate = input(false, { transform: booleanAttribute });

  /**
   * Empty-state copy when no options match. When omitted, uses `provideBaseUiI18n().noResults`.
   * @example
   * <ply-combobox emptyText="No people found" [options]="people"></ply-combobox>
   */
  readonly emptyText = input<string>();

  /** Empty-list copy: `emptyText` when set, otherwise the i18n dictionary. */
  protected readonly emptyLabel = computed(() => this.emptyText() ?? this.i18n.noResults);

  /**
   * Disables the field. Also set by Angular Forms via `setDisabledState`.
   * @example
   * <ply-combobox disabled [options]="people"></ply-combobox>
   */
  readonly disabledInput = input(false, { transform: booleanAttribute, alias: 'disabled' });

  /** Emits the typed query on every change. */
  readonly queryChange = output<string>();

  /** Emits when the user creates a value that is not in `options`. */
  readonly create = output<string>();

  /** Emits the selected option value. */
  readonly selectionChange = output<string | null>();

  protected readonly hostCls = computed(() =>
    cn('block w-full text-slate-700 dark:text-white', this.extraClass()),
  );

  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.formDisabled() || this.disabledInput());
  private suppressOpen = false;

  readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('inputElement');
  readonly origin = viewChild<ElementRef<HTMLElement>>('origin');
  readonly panelTemplate = viewChild<TemplateRef<unknown>>('panelTemplate');
  protected readonly optionTemplate = contentChild(ComboboxOptionDirective);

  readonly isOpen = signal(false);
  readonly query = signal('');
  readonly filterQuery = signal('');
  readonly selectedValue = signal<string | null>(null);
  readonly activeIndex = signal(-1);

  readonly listboxId = `ply-combobox-listbox-${comboboxIdCounter}`;
  readonly inputId = `ply-combobox-input-${comboboxIdCounter}`;
  readonly labelId = `ply-combobox-label-${comboboxIdCounter++}`;

  private onChange: (v: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private overlayRef: OverlayRef | null = null;
  private scrollIntoViewTimeout?: number;

  readonly selectedOption = computed(() => {
    const value = this.selectedValue();
    if (value == null) return null;
    return this.options().find((o) => o.value === value) ?? null;
  });

  readonly displayValue = computed(() => {
    if (this.isOpen()) return this.query();
    return this.selectedOption()?.label ?? '';
  });

  readonly filtered = computed(() => {
    const opts = this.options();
    if (this.filterMode() === 'none') return opts;
    const q = this.filterQuery().trim().toLowerCase();
    if (!q) return opts;
    return opts.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q),
    );
  });

  readonly canCreate = computed(() => {
    if (!this.allowCreate()) return false;
    const q = this.filterQuery().trim();
    if (!q) return false;
    return !this.filtered().some((o) => o.label.toLowerCase() === q.toLowerCase());
  });

  activeDescendant(): string | null {
    const index = this.activeIndex();
    return index >= 0 ? this.optionId(index) : null;
  }

  optionId(index: number): string {
    return `${this.listboxId}-option-${index}`;
  }

  onQueryInput(value: string): void {
    this.query.set(value);
    this.filterQuery.set(value);
    this.queryChange.emit(value);
    this.activeIndex.set(this.filtered().length || this.canCreate() ? 0 : -1);
    if (!this.isOpen()) this.openDropdown();
  }

  toggleDropdown(): void {
    if (this.isDisabled()) return;
    this.isOpen() ? this.closeDropdown() : this.openDropdown();
  }

  openDropdown(): void {
    if (this.suppressOpen || this.isDisabled() || this.isOpen()) return;
    this.isOpen.set(true);
    if (!this.filterQuery()) {
      this.query.set(this.selectedOption()?.label ?? '');
    }
    this.onTouched();
    const selectedIndex = this.filtered().findIndex((o) => o.value === this.selectedValue());
    this.activeIndex.set(selectedIndex >= 0 ? selectedIndex : this.filtered().length ? 0 : -1);
    this.attachOverlay();
    this.queueScrollActiveOptionIntoView();
  }

  closeDropdown(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.activeIndex.set(-1);
    this.query.set(this.selectedOption()?.label ?? '');
    this.filterQuery.set('');
    this.detachOverlay();
  }

  onComboboxKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;
    const items = this.filtered();
    const create = this.canCreate();
    const last = items.length + (create ? 1 : 0) - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openDropdown();
        } else if (last >= 0) {
          this.setActiveIndex(Math.min(this.activeIndex() + 1, last));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openDropdown();
        } else if (last >= 0) {
          this.setActiveIndex(Math.max(this.activeIndex() - 1, 0));
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openDropdown();
          return;
        }
        this.activateCurrent();
        break;
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.closeDropdown();
        }
        break;
      case 'Home':
        if (this.isOpen() && last >= 0) {
          event.preventDefault();
          this.setActiveIndex(0);
        }
        break;
      case 'End':
        if (this.isOpen() && last >= 0) {
          event.preventDefault();
          this.setActiveIndex(last);
        }
        break;
      case 'Tab':
        if (this.isOpen()) this.closeDropdown();
        break;
      default:
        break;
    }
  }

  activateCurrent(): void {
    const items = this.filtered();
    const index = this.activeIndex();
    if (this.canCreate() && index === items.length) {
      this.createFromQuery();
      return;
    }
    const opt = items[index];
    if (opt && !opt.disabled) this.selectOption(opt);
  }

  selectOption(opt: ComboboxOption): void {
    if (opt.disabled) return;
    this.selectedValue.set(opt.value);
    this.query.set(opt.label);
    this.closeDropdown();
    this.onChange(opt.value);
    this.selectionChange.emit(opt.value);
    this.focusWithoutOpen();
  }

  createFromQuery(): void {
    const q = this.filterQuery().trim() || this.query().trim();
    if (!q) return;
    this.create.emit(q);
    this.selectedValue.set(q);
    this.closeDropdown();
    this.onChange(q);
    this.selectionChange.emit(q);
    this.focusWithoutOpen();
  }

  clear(event?: Event): void {
    event?.stopPropagation();
    if (this.isDisabled()) return;
    this.selectedValue.set(null);
    this.query.set('');
    this.filterQuery.set('');
    this.queryChange.emit('');
    this.onChange(null);
    this.selectionChange.emit(null);
    this.inputElement()?.nativeElement.focus();
  }

  isSelected(opt: ComboboxOption): boolean {
    return opt.value === this.selectedValue();
  }

  protected optionRowClass(option: ComboboxOption, index: number): string {
    const highlighted = this.activeIndex() === index || this.isSelected(option);
    return cn(
      'relative cursor-pointer select-none px-4 py-2',
      option.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
      highlighted ? PRIMARY_SOFT : 'hover:bg-slate-100 dark:hover:bg-slate-700',
    );
  }

  protected createRowClass(): string {
    return cn(
      'cursor-pointer select-none px-4 py-2 text-[var(--ply-primary)]',
      this.activeIndex() === this.filtered().length
        ? 'bg-[var(--ply-primary-soft)]'
        : 'hover:bg-slate-100 dark:hover:bg-slate-700',
    );
  }

  handleClickOutside(e: Event): void {
    const target = e.target as Node;
    if (this.el.nativeElement.contains(target)) return;
    if (this.overlayRef?.overlayElement.contains(target)) return;
    this.closeDropdown();
  }

  ngOnDestroy(): void {
    this.detachOverlay();
    if (this.isSsrSafeBrowser) window.clearTimeout(this.scrollIntoViewTimeout);
  }

  writeValue(value: string | null): void {
    this.selectedValue.set(value ?? null);
    this.query.set(this.selectedOption()?.label ?? (value ?? ''));
    this.filterQuery.set('');
  }

  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(d: boolean): void {
    this.formDisabled.set(d);
  }

  private focusWithoutOpen(): void {
    this.suppressOpen = true;
    this.inputElement()?.nativeElement.focus();
    queueMicrotask(() => {
      this.suppressOpen = false;
    });
  }

  private setActiveIndex(index: number): void {
    this.activeIndex.set(index);
    this.queueScrollActiveOptionIntoView();
  }

  private queueScrollActiveOptionIntoView(): void {
    if (!this.isSsrSafeBrowser) return;
    window.clearTimeout(this.scrollIntoViewTimeout);
    this.scrollIntoViewTimeout = window.setTimeout(() => this.scrollActiveOptionIntoView());
  }

  private scrollActiveOptionIntoView(): void {
    const id = this.activeDescendant();
    if (!id || !this.isSsrSafeBrowser) return;
    document.getElementById(id)?.scrollIntoView({ block: 'nearest' });
  }

  private attachOverlay(): void {
    if (!this.isSsrSafeBrowser || this.overlayRef) return;
    const origin = this.origin()?.nativeElement;
    const template = this.panelTemplate();
    if (!origin || !template) return;

    const width = origin.getBoundingClientRect().width;
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(origin)
        .withFlexibleDimensions(false)
        .withPush(true)
        .withViewportMargin(8)
        .withPositions(ComboboxComponent.PANEL_POSITIONS),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      width,
      minWidth: width,
      maxHeight: 240,
    });
    this.overlayRef.attach(new TemplatePortal(template, this.viewContainerRef));
    window.addEventListener('resize', this.syncOverlaySize);
  }

  private detachOverlay(): void {
    if (this.isSsrSafeBrowser) window.removeEventListener('resize', this.syncOverlaySize);
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  private syncOverlaySize = (): void => {
    const origin = this.origin()?.nativeElement;
    if (!origin || !this.overlayRef) return;
    const width = origin.getBoundingClientRect().width;
    this.overlayRef.updateSize({ width, minWidth: width });
    this.overlayRef.updatePosition();
  };
}
