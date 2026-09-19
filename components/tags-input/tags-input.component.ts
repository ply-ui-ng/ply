import {
  Component,
  ElementRef,
  booleanAttribute,
  ChangeDetectionStrategy,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cn } from '../tw-merge/tw-merge';
import { ChipComponent } from '../chips/chip.component';

let tagsInputIdCounter = 0;

/**
 * Tag field that binds to `string[]` via Angular Forms. Enter, comma, or Tab adds a tag.
 *
 * @example
 * <ply-tags-input [(ngModel)]="labels" placeholder="Add a tag…"></ply-tags-input>
 */
@Component({
  selector: 'ply-tags-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ChipComponent],
  templateUrl: './tags-input.component.html',
  host: {
    '[class]': 'hostCls()',
    '(document:click)': 'handleClickOutside($event)',
  },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TagsInputComponent), multi: true },
  ],
})
export class TagsInputComponent implements ControlValueAccessor {
  private readonly el = inject(ElementRef);

  /**
   * Additional host classes.
   * @example
   * <ply-tags-input class="w-full" [(ngModel)]="tags"></ply-tags-input>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Visible label above the field.
   * @example
   * <ply-tags-input label="Topics" [(ngModel)]="topics"></ply-tags-input>
   */
  readonly label = input('');

  /**
   * Placeholder shown when there are no tags.
   * @example
   * <ply-tags-input placeholder="Type and press Enter"></ply-tags-input>
   */
  readonly placeholder = input('Add a tag…');

  /**
   * Optional suggestion list filtered by the current query.
   * @example
   * <ply-tags-input [suggestions]="allTags" [(ngModel)]="tags"></ply-tags-input>
   */
  readonly suggestions = input<string[]>([]);

  /**
   * Maximum number of tags. `0` means unlimited.
   * @example
   * <ply-tags-input [max]="8" [(ngModel)]="tags"></ply-tags-input>
   */
  readonly max = input(0);

  /**
   * Allow adding a tag that is not in `suggestions`.
   * @example
   * <ply-tags-input [allowCreate]="false" [suggestions]="allowed"></ply-tags-input>
   */
  readonly allowCreate = input(true, { transform: booleanAttribute });

  /**
   * Disables the field. Also set by Angular Forms via `setDisabledState`.
   * @example
   * <ply-tags-input disabled [(ngModel)]="tags"></ply-tags-input>
   */
  readonly disabledInput = input(false, { transform: booleanAttribute, alias: 'disabled' });

  /** Emits whenever the tag list changes. */
  readonly tagsChange = output<string[]>();

  protected readonly hostCls = computed(() => cn('relative block w-full', this.extraClass()));

  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.formDisabled() || this.disabledInput());

  readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('tagInput');
  readonly tags = signal<string[]>([]);
  readonly query = signal('');
  readonly isOpen = signal(false);
  readonly activeIndex = signal(0);

  readonly inputId = `ply-tags-input-${++tagsInputIdCounter}`;
  readonly listboxId = `ply-tags-listbox-${tagsInputIdCounter}`;
  readonly labelId = `ply-tags-label-${tagsInputIdCounter}`;

  private onChange: (v: string[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly atMax = computed(() => {
    const max = this.max();
    return max > 0 && this.tags().length >= max;
  });

  readonly filteredSuggestions = computed(() => {
    const q = this.query().trim().toLowerCase();
    const selected = new Set(this.tags().map((t) => t.toLowerCase()));
    return this.suggestions()
      .filter((s) => !selected.has(s.toLowerCase()))
      .filter((s) => !q || s.toLowerCase().includes(q))
      .slice(0, 8);
  });

  readonly showSuggestions = computed(
    () => this.isOpen() && !this.atMax() && this.filteredSuggestions().length > 0,
  );

  onQueryInput(value: string): void {
    this.query.set(value);
    this.isOpen.set(true);
    this.activeIndex.set(0);
    if (value.includes(',')) {
      const parts = value.split(',');
      const last = parts.pop() ?? '';
      for (const part of parts) this.addTag(part);
      this.query.set(last);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled() || this.atMax()) return;
    const suggestions = this.filteredSuggestions();

    if (event.key === 'ArrowDown' && suggestions.length) {
      event.preventDefault();
      this.isOpen.set(true);
      this.activeIndex.set(Math.min(this.activeIndex() + 1, suggestions.length - 1));
      return;
    }
    if (event.key === 'ArrowUp' && suggestions.length) {
      event.preventDefault();
      this.activeIndex.set(Math.max(this.activeIndex() - 1, 0));
      return;
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      if (this.showSuggestions() && suggestions[this.activeIndex()]) {
        event.preventDefault();
        this.addTag(suggestions[this.activeIndex()]);
        return;
      }
      if (this.query().trim()) {
        event.preventDefault();
        this.addTag(this.query());
      } else if (event.key === 'Enter') {
        event.preventDefault();
      }
      return;
    }
    if (event.key === 'Backspace' && !this.query() && this.tags().length) {
      this.removeAt(this.tags().length - 1);
      return;
    }
    if (event.key === 'Escape') {
      this.isOpen.set(false);
    }
  }

  addTag(raw: string): void {
    const tag = raw.trim();
    if (!tag || this.isDisabled() || this.atMax()) return;
    const exists = this.tags().some((t) => t.toLowerCase() === tag.toLowerCase());
    if (exists) {
      this.query.set('');
      return;
    }
    if (!this.allowCreate() && !this.suggestions().some((s) => s.toLowerCase() === tag.toLowerCase())) {
      return;
    }
    const next = [...this.tags(), tag];
    this.tags.set(next);
    this.query.set('');
    this.activeIndex.set(0);
    this.emit(next);
  }

  removeAt(index: number): void {
    if (this.isDisabled()) return;
    const next = this.tags().filter((_, i) => i !== index);
    this.tags.set(next);
    this.emit(next);
  }

  focusInput(): void {
    this.inputEl()?.nativeElement.focus();
    this.isOpen.set(true);
  }

  handleClickOutside(e: Event): void {
    if (!this.el.nativeElement.contains(e.target as Node)) {
      this.isOpen.set(false);
      this.onTouched();
    }
  }

  writeValue(value: string[] | null): void {
    this.tags.set(Array.isArray(value) ? [...value] : []);
  }

  registerOnChange(fn: (v: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(d: boolean): void {
    this.formDisabled.set(d);
  }

  private emit(next: string[]): void {
    this.onChange(next);
    this.onTouched();
    this.tagsChange.emit(next);
  }
}
