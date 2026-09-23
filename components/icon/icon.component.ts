import { Component, computed, input, inject, ChangeDetectionStrategy, booleanAttribute } from '@angular/core';
import { isDirectionalIcon } from '../direction/direction';
import { cn } from '../tw-merge/tw-merge';
import { BASE_UI_CONFIG } from '../config/config';

function cssSize(value: string | number | undefined | null): string | null {
  if (value == null || value === '') return null;
  return typeof value === 'number' || !isNaN(Number(value)) ? `${value}px` : String(value);
}

/**
 * A highly optimized SVG icon component.
 *
 * Icons in the default sprite (`assets/icons.svg`) are outline/stroke-only artwork —
 * their `<symbol>` elements set `fill="none"` directly, which (per SVG cascade rules)
 * always wins over an inherited `fill` from a `fill-*`/`text-*` class, so a plain CSS
 * class can never visually "fill" them. Use the `filled` input to switch to the
 * companion solid sprite (`assets/icons-filled.svg`) instead, e.g. for a toggled
 * favorite/wishlist heart or a filled star rating.
 *
 * Override sprite paths once with `provideBaseUI({ iconPath, filledIconPath })`.
 * Per-instance `[path]` / `[filledPath]` still win.
 *
 * @example
 * <ply-icon name="home" size="32" class="stroke-blue-500"></ply-icon>
 * <ply-icon name="heart" [filled]="isFavorited" class="fill-red-500"></ply-icon>
 */
@Component({
  selector: 'ply-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './icon.component.html',
  host: {
    '[class]': 'hostCls()',
    '[style.width]':  'sizeWithUnit()',
    '[style.height]': 'sizeWithUnit()',
  },
})
export class IconComponent {
  private readonly config = inject(BASE_UI_CONFIG);

  readonly extraClass = input('', { alias: 'class' });
  readonly name  = input<string | undefined>('');
  /**
   * Outline sprite URL. Empty uses `provideBaseUI().iconPath`
   * (default `assets/icons.svg`).
   */
  readonly path  = input('');
  readonly color = input('');
  /**
   * Explicit size. Empty uses `provideBaseUI().defaultSize` unless the host
   * already has a `w-*` / `h-*` class (those keep class-based sizing).
   */
  readonly size  = input<string | number>('');

  /** Renders the solid variant from `filledPath` instead of the outline sprite. */
  readonly filled = input(false, { transform: booleanAttribute });

  /**
   * Solid sprite URL when `filled` is true. Empty uses
   * `provideBaseUI().filledIconPath` (default `assets/icons-filled.svg`).
   */
  readonly filledPath = input('');

  /**
   * `auto` mirrors icons that point left or right when an ancestor has `dir="rtl"`.
   * `on` always mirrors. `off` keeps the glyph pointing the same way.
   */
  readonly mirror = input<'auto' | 'on' | 'off'>('auto');

  protected readonly hostCls = computed(() => {
    const extra = this.extraClass();
    const sized = this.sizeWithUnit() != null;
    const mode = this.mirror();
    const mirror = mode === 'on' || (mode === 'auto' && isDirectionalIcon(this.name()));
    return cn(
      'inline-flex align-middle',
      !sized && !/(?:^|\s)w-/.test(extra) && 'w-6',
      !sized && !/(?:^|\s)h-/.test(extra) && 'h-6',
      !/(?:^|\s)(?:stroke-|text-|fill-)/.test(extra) && 'stroke-current',
      mirror && 'rtl:-scale-x-100',
      extra,
    );
  });

  protected readonly resolvedPath = computed(() => {
    if (this.filled()) {
      return this.filledPath() || this.config.filledIconPath;
    }
    return this.path() || this.config.iconPath;
  });

  readonly sizeWithUnit = computed(() => {
    const explicit = cssSize(this.size());
    if (explicit) return explicit;
    const extra = this.extraClass();
    if (/(?:^|\s)w-/.test(extra) || /(?:^|\s)h-/.test(extra)) return null;
    return cssSize(this.config.defaultSize);
  });
}
