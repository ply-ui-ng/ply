import { describe, expect, it } from 'vitest';
import { canonicalComponentName } from './aliases';

describe('component aliases', () => {
  it('maps shadcn sheet to drawer', () => {
    expect(canonicalComponentName('sheet')).toBe('drawer');
    expect(canonicalComponentName('carousel')).toBe('slider');
    expect(canonicalComponentName('range')).toBe('range-slider');
  });

  it('leaves real registry names alone', () => {
    expect(canonicalComponentName('drawer')).toBe('drawer');
    expect(canonicalComponentName('button')).toBe('button');
  });

  it('maps legacy base-* directive items to ply-*', () => {
    expect(canonicalComponentName('base-list-item')).toBe('ply-list-item');
    expect(canonicalComponentName('base-tab-icon')).toBe('ply-tab-icon');
    expect(canonicalComponentName('base-group-button')).toBe('ply-group-button');
    expect(canonicalComponentName('base-dropdown-menu-item')).toBe('ply-dropdown-menu-item');
    expect(canonicalComponentName('base-context-menu-item')).toBe('ply-context-menu-item');
  });
});
