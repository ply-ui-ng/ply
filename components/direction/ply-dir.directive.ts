import { DOCUMENT } from '@angular/common';
import { Directive, computed, inject, input } from '@angular/core';
import { resolveWritingDirection } from './direction';

/**
 * Sets `dir` on the host so descendant Ply components follow this subtree.
 * `auto` uses the document language (Arabic, Hebrew, Persian, Urdu, …).
 *
 * @example
 * <section plyDir="rtl">…</section>
 */
@Directive({
  selector: '[plyDir]',
  host: {
    '[attr.dir]': 'resolved()',
  },
})
export class PlyDirDirective {
  private readonly doc = inject(DOCUMENT);

  /** `ltr`, `rtl`, or `auto`. */
  readonly plyDir = input<'ltr' | 'rtl' | 'auto'>('ltr');

  protected readonly resolved = computed(() => {
    const lang = this.doc.documentElement?.lang || (typeof navigator !== 'undefined' ? navigator.language : '');
    return resolveWritingDirection(this.plyDir(), lang);
  });
}
