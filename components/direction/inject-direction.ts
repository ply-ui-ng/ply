import { DOCUMENT } from '@angular/common';
import { ElementRef, computed, inject, type Signal } from '@angular/core';
import { directionFromElement, type WritingDirection } from './direction';
import { DirectionRegistry } from './direction.service';

/**
 * Writing direction of the nearest `dir` ancestor (or `<html>`).
 * Updates when that attribute changes.
 *
 * @example
 * private readonly writingDirection = injectElementDirection();
 */
export function injectElementDirection(): Signal<WritingDirection> {
  const el = inject(ElementRef);
  const doc = inject(DOCUMENT);
  const registry = inject(DirectionRegistry);
  return computed(() => {
    registry.tick();
    return directionFromElement(el.nativeElement as Element, doc);
  });
}

/** Document direction, for services that open overlays outside a component host. */
export function injectDocumentDirection(): Signal<WritingDirection> {
  const doc = inject(DOCUMENT);
  const registry = inject(DirectionRegistry);
  return computed(() => {
    registry.tick();
    return directionFromElement(null, doc);
  });
}
