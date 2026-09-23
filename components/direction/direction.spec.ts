import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  directionFromElement,
  inlineArrowDelta,
  inlineScrollState,
  isDirectionalIcon,
  isInlineForwardKey,
  logicalToPhysical,
  readingEdge,
  resolveBoxEdge,
  resolveCornerPosition,
  resolveWritingDirection,
} from './direction';
import { DirectionRegistry } from './direction.service';
import { PlyDirDirective } from './ply-dir.directive';

describe('direction helpers', () => {
  it('resolves dir and auto locales', () => {
    expect(resolveWritingDirection('rtl')).toBe('rtl');
    expect(resolveWritingDirection('LTR')).toBe('ltr');
    expect(resolveWritingDirection('auto', 'ar-EG')).toBe('rtl');
    expect(resolveWritingDirection('auto', 'en')).toBe('ltr');
    expect(resolveWritingDirection(null)).toBe('ltr');
  });

  it('reads the nearest dir ancestor', () => {
    document.documentElement.removeAttribute('dir');
    const host = document.createElement('div');
    host.setAttribute('dir', 'rtl');
    const child = document.createElement('span');
    host.appendChild(child);
    expect(directionFromElement(child, document)).toBe('rtl');
    expect(directionFromElement(null, document)).toBe('ltr');
  });

  it('maps start and end without moving explicit left and right', () => {
    expect(logicalToPhysical('start', 'ltr')).toBe('left');
    expect(logicalToPhysical('end', 'ltr')).toBe('right');
    expect(logicalToPhysical('start', 'rtl')).toBe('right');
    expect(logicalToPhysical('end', 'rtl')).toBe('left');
    expect(logicalToPhysical('left', 'rtl')).toBe('left');
    expect(logicalToPhysical('right', 'rtl')).toBe('right');
  });

  it('mirrors the shell start slot onto the physical right in RTL', () => {
    expect(readingEdge('left', 'ltr')).toBe('left');
    expect(readingEdge('left', 'rtl')).toBe('right');
    expect(readingEdge('right', 'rtl')).toBe('left');
  });

  it('follows the WAI-ARIA horizontal arrow model', () => {
    expect(inlineArrowDelta('ArrowRight', 'ltr')).toBe(1);
    expect(inlineArrowDelta('ArrowLeft', 'ltr')).toBe(-1);
    expect(inlineArrowDelta('ArrowRight', 'rtl')).toBe(-1);
    expect(inlineArrowDelta('ArrowLeft', 'rtl')).toBe(1);
    expect(inlineArrowDelta('ArrowDown', 'rtl')).toBeNull();
    expect(isInlineForwardKey('ArrowLeft', 'rtl')).toBe(true);
    expect(isInlineForwardKey('ArrowRight', 'ltr')).toBe(true);
  });

  it('resolves corners and drawer edges', () => {
    expect(resolveCornerPosition('top-end', 'ltr')).toBe('top-right');
    expect(resolveCornerPosition('top-end', 'rtl')).toBe('top-left');
    expect(resolveCornerPosition('bottom-right', 'rtl')).toBe('bottom-right');
    expect(resolveBoxEdge('end', 'ltr')).toBe('right');
    expect(resolveBoxEdge('end', 'rtl')).toBe('left');
    expect(resolveBoxEdge('left', 'rtl')).toBe('left');
    expect(resolveBoxEdge('top', 'rtl')).toBe('top');
  });

  it('normalizes RTL scroll offsets from either browser model', () => {
    expect(inlineScrollState({ scrollLeft: 0, scrollWidth: 500, clientWidth: 100 }, 'ltr')).toEqual({
      atStart: true,
      atEnd: false,
    });
    expect(inlineScrollState({ scrollLeft: 0, scrollWidth: 500, clientWidth: 100 }, 'rtl')).toEqual({
      atStart: true,
      atEnd: false,
    });
    expect(inlineScrollState({ scrollLeft: -400, scrollWidth: 500, clientWidth: 100 }, 'rtl')).toEqual({
      atStart: false,
      atEnd: true,
    });
    expect(inlineScrollState({ scrollLeft: 400, scrollWidth: 500, clientWidth: 100 }, 'rtl')).toEqual({
      atStart: true,
      atEnd: false,
    });
  });

  it('detects icons that point along the inline axis', () => {
    expect(isDirectionalIcon('chevron-left')).toBe(true);
    expect(isDirectionalIcon('arrow-right')).toBe(true);
    expect(isDirectionalIcon('chevron-down')).toBe(false);
    expect(isDirectionalIcon('close')).toBe(false);
  });
});

@Component({
  selector: 'ply-dir-host',
  imports: [PlyDirDirective],
  template: `<div plyDir="rtl" id="region"></div>`,
})
class DirHost {}

describe('DirectionRegistry', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('dir');
  });

  it('sets dir on the document element', () => {
    TestBed.configureTestingModule({});
    const registry = TestBed.inject(DirectionRegistry);
    registry.setDocumentDirection('rtl');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    registry.setDocumentDirection('ltr');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
  });

  it('plyDir writes the dir attribute', () => {
    TestBed.configureTestingModule({ imports: [DirHost] });
    const fixture = TestBed.createComponent(DirHost);
    fixture.detectChanges();
    const region = fixture.nativeElement.querySelector('#region') as HTMLElement;
    expect(region.getAttribute('dir')).toBe('rtl');
  });
});
