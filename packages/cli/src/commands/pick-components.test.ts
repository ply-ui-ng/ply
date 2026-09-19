import { describe, expect, it } from 'vitest';
import type { RegistryIndexEntry } from '../registry';
import {
  canPromptInteractively,
  catalogFilterChoices,
  filterCatalog,
  pickerTitle,
  toPickerChoices,
} from './pick-components';

function item(
  name: string,
  extras: Partial<RegistryIndexEntry> = {},
): RegistryIndexEntry {
  return {
    name,
    tier: 'free',
    category: 'component',
    dependencies: [],
    registryDependencies: [],
    description: '',
    usage: '',
    keywords: [],
    ...extras,
  };
}

const catalog: RegistryIndexEntry[] = [
  item('button'),
  item('card', { keywords: ['surface', 'panel'] }),
  item('data-table', {
    tier: 'pro',
    category: 'widget',
    description: 'Sortable grid',
    keywords: ['table'],
  }),
  item('layout-dashboard', { tier: 'pro', category: 'page-layout' }),
  item('login-form', { category: 'block' }),
];

describe('canPromptInteractively', () => {
  it('is false when --yes is set, even in a TTY', () => {
    expect(canPromptInteractively({ yes: true }, true)).toBe(false);
  });

  it('is false when stdin is not a TTY', () => {
    expect(canPromptInteractively({}, false)).toBe(false);
  });

  it('is true in a TTY without --yes', () => {
    expect(canPromptInteractively({}, true)).toBe(true);
  });
});

describe('filterCatalog', () => {
  it('returns the full index for all', () => {
    expect(filterCatalog(catalog, 'all')).toHaveLength(5);
  });

  it('filters by tier', () => {
    expect(filterCatalog(catalog, 'free').map((i) => i.name)).toEqual([
      'button',
      'card',
      'login-form',
    ]);
    expect(filterCatalog(catalog, 'pro').map((i) => i.name)).toEqual([
      'data-table',
      'layout-dashboard',
    ]);
  });

  it('filters by registry category', () => {
    expect(filterCatalog(catalog, 'category:block').map((i) => i.name)).toEqual(['login-form']);
    expect(filterCatalog(catalog, 'category:widget').map((i) => i.name)).toEqual(['data-table']);
  });
});

describe('catalogFilterChoices', () => {
  it('lists All, Free, Pro, then categories that have items', () => {
    const values = catalogFilterChoices(catalog).map((c) => c.value);
    expect(values[0]).toBe('all');
    expect(values).toContain('free');
    expect(values).toContain('pro');
    expect(values).toContain('category:block');
    expect(values).not.toContain('category:shell');
  });
});

describe('pickerTitle', () => {
  it('puts name, tier, category, and keywords in the filterable title', () => {
    expect(pickerTitle(catalog[2])).toBe('data-table  (pro · Widgets)  table');
    expect(pickerTitle(catalog[1])).toContain('surface');
  });
});

describe('toPickerChoices', () => {
  it('uses the component name as the value', () => {
    expect(toPickerChoices(catalog).find((c) => c.value === 'data-table')?.title).toContain(
      'data-table',
    );
  });
});
