import { Component,
  ElementRef,
  HostListener,
  OnDestroy,
  computed,
  forwardRef,
  inject,
  input,

  signal,
  viewChild,
  ChangeDetectionStrategy, booleanAttribute, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { injectElementDirection } from '../direction/inject-direction';
import { cn } from '../tw-merge/tw-merge';

const PANEL_WIDTH  = 248;
const PANEL_HEIGHT = 228;
const GAP = 8;
let colorPickerIdCounter = 0;

/**
 * A color picker with preset swatches and a hex input field.
 * Panel is rendered at `position: fixed` calculated from the trigger's viewport rect.
 * Integrates with Angular Forms via ControlValueAccessor.
 *
 * @example
 * <ply-color-picker [(ngModel)]="brandColor"></ply-color-picker>
 */
@Component({
  selector: 'ply-color-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './color-picker.component.html',
  host: { '[class]': 'hostCls()' },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ColorPickerComponent), multi: true }]
})
export class ColorPickerComponent implements OnDestroy {
  private readonly writingDirection = injectElementDirection();
  /** Prerendering destroys the app after render; there is nothing to unbind on the server. */
  private readonly isSsrSafeBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly panelId = `ply-color-picker-panel-${++colorPickerIdCounter}`;

  readonly extraClass = input('', { alias: 'class' });
  readonly pickerLabel = input('Color picker');
  readonly swatches   = input<string[]>([
    '#ef4444','#f97316','#eab308','#22c55e','#14b8a6',
    '#3b82f6','#8b5cf6','#ec4899','#64748b','#0f172a',
    '#ffffff','#f1f5f9']);

  protected readonly hostCls = computed(() => cn('inline-block', this.extraClass()));

  readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');

  /** Whether the control is disabled (consumer-facing input). */


  readonly disabled = input(false, { transform: booleanAttribute });


  /** Disabled state applied by Angular Forms via `setDisabledState`. */


  private readonly formDisabled = signal(false);


  /** Effective disabled state: consumer `disabled` input OR forms-disabled. */


  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());


  readonly isOpen    = signal(false);
  readonly value     = signal('#3b82f6');
  readonly hexInput  = signal('#3b82f6');
  readonly panelStyle = signal<Record<string, string>>({});

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private el = inject(ElementRef);

  toggle() { this.isOpen() ? this.close() : this.open(); }

  open() {
    if (this.isDisabled()) return;
    this.isOpen.set(true);
    this.calcPosition();
    window.addEventListener('scroll', this.onScrollResize, true);
    window.addEventListener('resize', this.onScrollResize);
  }

  close() {
    this.isOpen.set(false);
    window.removeEventListener('scroll', this.onScrollResize, true);
    window.removeEventListener('resize', this.onScrollResize);
  }

  private onScrollResize = () => { if (this.isOpen()) this.calcPosition(); };

  private calcPosition() {
    const btn = this.trigger()?.nativeElement;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const top  = rect.bottom + GAP >= vh - PANEL_HEIGHT
      ? Math.max(GAP, rect.top - GAP - PANEL_HEIGHT)
      : rect.bottom + GAP;
    const aligned = this.writingDirection() === 'rtl' ? rect.right - PANEL_WIDTH : rect.left;
    const left = Math.max(GAP, Math.min(aligned, vw - PANEL_WIDTH - GAP));
    this.panelStyle.set({ position: 'fixed', top: `${top}px`, left: `${left}px`, width: `${PANEL_WIDTH}px`, zIndex: '10000' });
  }

  selectSwatch(color: string) {
    this.value.set(color);
    this.hexInput.set(color);
    this.emit();
  }

  onHexInput(hex: string) {
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) { this.value.set(hex); this.emit(); }
  }

  onNativeInput(e: Event) {
    this.value.set((e.target as HTMLInputElement).value);
    this.hexInput.set(this.value());
    this.emit();
  }

  private emit() { this.onChange(this.value()); this.onTouched(); }

  isActiveColor(color: string): boolean { return this.value()?.toLowerCase() === color.toLowerCase(); }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target as Node)) this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen()) this.close();
  }

  ngOnDestroy() {
    if (!this.isSsrSafeBrowser) return;
    this.close();
  }

  writeValue(v: string)                    { this.value.set(v ?? '#3b82f6'); this.hexInput.set(this.value()); }
  registerOnChange(fn: (v: string) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void)         { this.onTouched = fn; }
  setDisabledState(d: boolean)              { this.formDisabled.set(d); }
}
