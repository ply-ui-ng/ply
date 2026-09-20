import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../registry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../registry')>();
  return {
    ...actual,
    fetchIndex: vi.fn(),
  };
});

import { fetchIndex } from '../registry';
import { searchComponents } from './search-components';

const mockedIndex = vi.mocked(fetchIndex);

function body(result: { content: { type: string; text?: string }[] }) {
  return JSON.parse(result.content[0].text || '{}');
}

describe('search_components aliases', () => {
  beforeEach(() => {
    mockedIndex.mockReset();
    mockedIndex.mockResolvedValue([
      {
        name: 'drawer',
        tier: 'free',
        category: 'component',
        description: 'Slide-in panel',
        usage: '<ply-drawer>',
        keywords: [],
        dependencies: [],
        registryDependencies: [],
      },
      {
        name: 'slider',
        tier: 'free',
        category: 'component',
        description: 'Image carousel',
        usage: '<ply-slider>',
        keywords: ['carousel', 'gallery'],
        dependencies: [],
        registryDependencies: [],
      },
      {
        name: 'carousel',
        tier: 'free',
        category: 'component',
        description: 'Horizontal scroller',
        usage: '<ply-horizontal-carousel>',
        keywords: [],
        dependencies: [],
        registryDependencies: [],
      },
      {
        name: 'range-slider',
        tier: 'free',
        category: 'component',
        description: 'Numeric range',
        usage: '<ply-range-slider>',
        keywords: ['slider'],
        dependencies: [],
        registryDependencies: [],
      },
      {
        name: 'button',
        tier: 'free',
        category: 'component',
        description: 'Click target',
        usage: '[ply-button]',
        keywords: [],
        dependencies: [],
        registryDependencies: [],
      },
    ]);
  });

  it('maps sheet to drawer without requiring both tokens in the haystack', async () => {
    const result = await searchComponents({ query: 'sheet' });
    const names = body(result).matches.map((m: { name: string }) => m.name);
    expect(names).toContain('drawer');
    expect(names).not.toContain('button');
  });

  it('finds the carousel registry item without aliasing it to slider', async () => {
    const result = await searchComponents({ query: 'carousel' });
    const names = body(result).matches.map((m: { name: string }) => m.name);
    expect(names).toContain('carousel');
  });

  it('still finds the gallery slider when searching gallery', async () => {
    const result = await searchComponents({ query: 'gallery' });
    const names = body(result).matches.map((m: { name: string }) => m.name);
    expect(names).toContain('slider');
  });

  it('tells the client to install via the CLI, not add_components', async () => {
    const result = await searchComponents({ query: 'button' });
    const hint = body(result).hint as string;
    expect(hint).toContain('npx ply-ui-cli add');
    expect(hint).toMatch(/does not write files/i);
  });
});
