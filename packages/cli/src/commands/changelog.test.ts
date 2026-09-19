import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../registry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../registry')>();
  return {
    ...actual,
    fetchIndex: vi.fn(),
  };
});

import { fetchIndex, SITE_URL } from '../registry';
import { changelog } from './changelog';

const mockedIndex = vi.mocked(fetchIndex);

const changelogPayload = {
  months: [
    {
      entries: [
        {
          hash: 'abc1234',
          date: '2026-09-11',
          scope: 'button',
          breaking: false,
          description: 'Tweak the button host class merge.',
          type: 'fix',
          components: ['button'],
        },
        {
          hash: 'def5678',
          date: '2026-09-10',
          scope: 'cli',
          breaking: false,
          description: 'Add doctor checks.',
          type: 'feat',
          components: ['cli'],
        },
      ],
    },
  ],
};

describe('changelog', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    mockedIndex.mockReset();
    process.exitCode = 0;
  });

  function stubChangelog(payload: unknown) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        expect(String(url)).toContain('/assets/changelog.json');
        return { ok: true, json: async () => payload };
      })
    );
  }

  it('prints entries whose components list includes the name', async () => {
    stubChangelog(changelogPayload);
    const lines: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
      lines.push(String(msg ?? ''));
    });

    await changelog(['button']);

    expect(process.exitCode ?? 0).toBe(0);
    expect(lines.join('\n')).toContain('button — 1 matching update');
    expect(lines.join('\n')).toContain('Tweak the button host class merge.');
    expect(lines.join('\n')).not.toContain('Add doctor checks.');
    expect(lines.join('\n')).toContain(`${SITE_URL}/changelog`);
  });

  it('matches conventional-commit scope when components is missing', async () => {
    stubChangelog({
      months: [
        {
          entries: [
            {
              hash: 'aaa1111',
              date: '2026-01-01',
              scope: 'dialog',
              description: 'Focus trap fix.',
              type: 'fix',
            },
          ],
        },
      ],
    });
    const lines: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
      lines.push(String(msg ?? ''));
    });

    await changelog(['dialog']);
    expect(lines.join('\n')).toContain('Focus trap fix.');
  });

  it('suggests names when the registry does not know the item', async () => {
    stubChangelog(changelogPayload);
    mockedIndex.mockResolvedValue([
      {
        name: 'button',
        tier: 'free',
        category: 'component',
        dependencies: [],
        registryDependencies: [],
        description: '',
        usage: '',
        keywords: [],
      },
    ]);
    const errors: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((msg?: unknown) => {
      errors.push(String(msg ?? ''));
    });

    await changelog(['buton']);
    expect(process.exitCode).toBe(1);
    expect(errors.join('\n')).toContain("Unknown component: 'buton'");
    expect(errors.join('\n')).toContain('button');
  });

  it('points at /changelog when a known name has no entries', async () => {
    stubChangelog(changelogPayload);
    mockedIndex.mockResolvedValue([
      {
        name: 'card',
        tier: 'free',
        category: 'component',
        dependencies: [],
        registryDependencies: [],
        description: '',
        usage: '',
        keywords: [],
      },
    ]);
    const lines: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
      lines.push(String(msg ?? ''));
    });

    await changelog(['card']);
    expect(process.exitCode ?? 0).toBe(0);
    expect(lines.join('\n')).toContain("No changelog entries for 'card' yet.");
  });

  it('exits when the name is missing', async () => {
    const errors: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((msg?: unknown) => {
      errors.push(String(msg ?? ''));
    });
    await changelog([]);
    expect(process.exitCode).toBe(1);
    expect(errors.join('\n')).toContain('changelog <name>');
  });
});
