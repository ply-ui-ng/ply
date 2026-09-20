import { Component,
  ElementRef,
  OnDestroy,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  contentChild,
  ChangeDetectionStrategy, booleanAttribute, PLATFORM_ID } from '@angular/core';
import { NgStyle, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { cn, PRIMARY_SOFT } from '../tw-merge/tw-merge';
import { BASE_UI_I18N } from '../i18n/i18n';
import { CustomSelectOptionDirective } from './custom-select-option.directive';

let customSelectIdCounter = 0;

/**
 * A searchable dropdown select component. Bind `[(ngModel)]` or `formControlName`.
 * Override option rows with `<ng-template plySelectOption>`. Unit tests: `CustomSelectHarness`
 * with `TestbedHarnessEnvironment.loader(fixture)`.
 *
 * @example
 * <ply-custom-select [(ngModel)]="selectedId" [options]="users" displayKey="name" valueKey="id">
 *   <ng-template plySelectOption let-option let-label="label">
 *     <span>{{ label }}</span>
 *   </ng-template>
 * </ply-custom-select>
 */
@Component({
  selector: 'ply-custom-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgStyle, NgTemplateOutlet, FormsModule, IconComponent],
  templateUrl: './custom-select.component.html',
  host: {
    '[class]': 'hostCls()',
    '(document:click)': 'handleClickOutside($event)',
  },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomSelectComponent), multi: true },
  ],
})
export class CustomSelectComponent implements ControlValueAccessor, OnDestroy {
  /** Prerendering destroys the app after render; there is nothing to unbind on the server. */
  private readonly isSsrSafeBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly i18n = inject(BASE_UI_I18N);
  readonly extraClass = input('', { alias: 'class' });
  readonly label = input('');
  readonly placeholder = input('Select an option');
  readonly options = input<unknown[]>([]);
  readonly displayKey = input('label');
  readonly valueKey = input('value');
  readonly multiple = input(false, { transform: booleanAttribute });

  readonly selectionChange = output<unknown>();

  protected readonly hostCls = computed(() =>
    cn('block w-full text-slate-700 dark:text-white', this.extraClass())
  );

  private readonly _disabled = signal(false);
  readonly disabled = this._disabled.asReadonly();

  readonly buttonElement = viewChild<ElementRef<HTMLButtonElement>>('buttonElement');
  protected readonly optionTemplate = contentChild(CustomSelectOptionDirective);

  readonly isOpen = signal(false);
  readonly selectedOption = signal<unknown>(null);
  readonly selectedLabel = signal('');
  readonly dropdownStyles = signal<Record<string, string | number>>({});
  readonly activeIndex = signal(-1);

  readonly listboxId = `ply-select-listbox-${customSelectIdCounter}`;
  readonly labelId = `ply-select-label-${customSelectIdCounter++}`;

  private el = inject(ElementRef);
  private onChange: (v: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private typeaheadBuffer = '';
  private typeaheadTimeout?: number;
  private positionTimeout?: number;

  /** Returns the id of the currently highlighted option for aria-activedescendant. */
  activeDescendant(): string | null {
    const index = this.activeIndex();
    return index >= 0 ? this.optionId(index) : null;
  }

  optionId(index: number): string {
    return `${this.listboxId}-option-${index}`;
  }

  toggleDropdown(): void {
    if (this.disabled()) return;
    if (this.isOpen()) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown(): void {
    if (this.disabled() || this.isOpen()) return;
    this.isOpen.set(true);
    this.onTouched();
    const selectedIndex = this.getSelectedIndex();
    this.activeIndex.set(selectedIndex >= 0 ? selectedIndex : 0);
    window.clearTimeout(this.positionTimeout);
    this.positionTimeout = window.setTimeout(() => {
      this.calcPosition();
      this.scrollActiveOptionIntoView();
    });
    this.addOverlayListeners();
  }

  closeDropdown(): void {
    if (!this.isOpen()) return;
    window.clearTimeout(this.positionTimeout);
    this.isOpen.set(false);
    this.activeIndex.set(-1);
    this.clearTypeahead();
    this.removeOverlayListeners();
  }

  onComboboxKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    const opts = this.options();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openDropdown();
        } else if (opts.length > 0) {
          this.setActiveIndex(Math.min(this.activeIndex() + 1, opts.length - 1));
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openDropdown();
          if (opts.length > 0) {
            this.setActiveIndex(Math.max(this.getSelectedIndex(), 0));
          }
        } else if (opts.length > 0) {
          this.setActiveIndex(Math.max(this.activeIndex() - 1, 0));
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.isOpen() && this.activeIndex() >= 0 && opts[this.activeIndex()]) {
          this.selectOption(opts[this.activeIndex()]);
        } else if (!this.isOpen()) {
          this.openDropdown();
        }
        break;

      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.closeDropdown();
        }
        break;

      case 'Home':
        if (this.isOpen() && opts.length > 0) {
          event.preventDefault();
          this.setActiveIndex(0);
        }
        break;

      case 'End':
        if (this.isOpen() && opts.length > 0) {
          event.preventDefault();
          this.setActiveIndex(opts.length - 1);
        }
        break;

      case 'Tab':
        if (this.isOpen()) {
          this.closeDropdown();
        }
        break;

      default:
        if (this.isOpen() && this.isPrintableKey(event)) {
          this.handleTypeahead(event.key);
        }
        break;
    }
  }

  calcPosition(): void {
    const el = this.buttonElement()?.nativeElement;
    if (!this.isOpen() || !el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const top =
      spaceBelow < 240 && rect.top > spaceBelow ? 'auto' : `${rect.bottom + 4}px`;
    const bottom = top === 'auto' ? `${window.innerHeight - rect.top + 4}px` : 'auto';
    this.dropdownStyles.set({
      position: 'fixed',
      top,
      bottom,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 10000,
    });
  }

  private addOverlayListeners(): void {
    window.addEventListener('scroll', this.updatePosition, true);
    window.addEventListener('resize', this.updatePosition);
  }

  private removeOverlayListeners(): void {
    window.removeEventListener('scroll', this.updatePosition, true);
    window.removeEventListener('resize', this.updatePosition);
  }

  private updatePosition = (): void => {
    if (this.isOpen()) this.calcPosition();
  };

  /** Reads an arbitrary key off an option object; used for track expressions and display in the template. */
  optionKey(opt: unknown, key: string): unknown {
    return (opt as Record<string, unknown>)[key];
  }

  selectOption(opt: unknown): void {
    const value = this.valueKey()
      ? (opt as Record<string, unknown>)[this.valueKey()]
      : opt;
    this.writeValue(value);
    this.closeDropdown();
    this.onChange(value);
    this.selectionChange.emit(value);
    this.buttonElement()?.nativeElement.focus();
  }

  isSelected(opt: unknown): boolean {
    return (
      (this.valueKey()
        ? (opt as Record<string, unknown>)[this.valueKey()]
        : opt) === this.selectedOption()
    );
  }

  protected optionRowClass(option: unknown, index: number): string {
    const highlighted = this.isSelected(option) || this.activeIndex() === index;
    return cn(
      'relative cursor-pointer select-none py-2 px-4 transition-colors duration-150',
      highlighted ? PRIMARY_SOFT : 'hover:bg-slate-100 dark:hover:bg-slate-700',
    );
  }

  handleClickOutside(e: Event): void {
    if (!this.el.nativeElement.contains(e.target as Node)) {
      this.closeDropdown();
    }
  }

  ngOnDestroy(): void {
    if (!this.isSsrSafeBrowser) return;
    window.clearTimeout(this.positionTimeout);
    this.removeOverlayListeners();
    this.clearTypeahead();
  }

  writeValue(value: unknown): void {
    this.selectedOption.set(value);
    if (value === null || value === undefined) {
      this.selectedLabel.set('');
      return;
    }
    const found = this.options().find(
      (o) =>
        (this.valueKey()
          ? (o as Record<string, unknown>)[this.valueKey()]
          : o) === value
    );
    this.selectedLabel.set(
      found
        ? this.displayKey()
          ? String((found as Record<string, unknown>)[this.displayKey()])
          : String(found)
        : String(value)
    );
  }

  registerOnChange(fn: (v: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(d: boolean): void {
    this._disabled.set(d);
  }

  private getSelectedIndex(): number {
    const selected = this.selectedOption();
    return this.options().findIndex(
      (o) =>
        (this.valueKey()
          ? (o as Record<string, unknown>)[this.valueKey()]
          : o) === selected
    );
  }

  private setActiveIndex(index: number): void {
    this.activeIndex.set(index);
    window.clearTimeout(this.positionTimeout);
    this.positionTimeout = window.setTimeout(() => this.scrollActiveOptionIntoView());
  }

  private scrollActiveOptionIntoView(): void {
    const id = this.activeDescendant();
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ block: 'nearest' });
  }

  private isPrintableKey(event: KeyboardEvent): boolean {
    return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
  }

  private handleTypeahead(char: string): void {
    this.typeaheadBuffer += char.toLowerCase();
    window.clearTimeout(this.typeaheadTimeout);
    this.typeaheadTimeout = window.setTimeout(() => this.clearTypeahead(), 500);

    const opts = this.options();
    const start = this.activeIndex() + 1;
    const matchIndex = this.findTypeaheadMatch(opts, start);
    if (matchIndex >= 0) {
      this.setActiveIndex(matchIndex);
    }
  }

  private findTypeaheadMatch(opts: unknown[], start: number): number {
    if (!this.typeaheadBuffer) return -1;

    for (let offset = 0; offset < opts.length; offset++) {
      const index = (start + offset) % opts.length;
      const label = this.getOptionLabel(opts[index]).toLowerCase();
      if (label.startsWith(this.typeaheadBuffer)) {
        return index;
      }
    }
    return -1;
  }

  private getOptionLabel(opt: unknown): string {
    return this.displayKey()
      ? String((opt as Record<string, unknown>)[this.displayKey()])
      : String(opt);
  }

  private clearTypeahead(): void {
    this.typeaheadBuffer = '';
    window.clearTimeout(this.typeaheadTimeout);
  }
}
