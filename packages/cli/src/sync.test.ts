import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchIndex, fetchItem } from './registry';
import {
  classifyFileStatus,
  computeComponentDiff,
  hasChanges,
  hasConflicts,
  type ComponentDiff,
  type FileStatus,
} from './sync';
import type { LockFile } from './lockfile';

vi.mock('./registry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./registry')>();
  return {
    ...actual,
    fetchIndex: vi.fn(async () => {
      throw new Error('fetchIndex must not be called from computeComponentDiff');
    }),
    fetchItem: vi.fn(async () => {
      throw new Error('fetchItem should not run in this test');
    }),
  };
});

const BASE = 'aaa';
const LOCAL = 'bbb';
const UPSTREAM = 'ccc';

describe('classifyFileStatus', () => {
  const cases: Array<{
    name: string;
    installedHash?: string;
    localHash?: string;
    upstreamHash?: string;
    expected: FileStatus;
  }> = [
    {
      name: 'all three match',
      installedHash: BASE,
      localHash: BASE,
      upstreamHash: BASE,
      expected: 'unchanged',
    },
    {
      name: 'safe upstream update (local still at baseline)',
      installedHash: BASE,
      localHash: BASE,
      upstreamHash: UPSTREAM,
      expected: 'upstream-changed',
    },
    {
      name: 'local-only edit (upstream still at baseline)',
      installedHash: BASE,
      localHash: LOCAL,
      upstreamHash: BASE,
      expected: 'locally-modified',
    },
    {
      name: 'genuine conflict (both diverged)',
      installedHash: BASE,
      localHash: LOCAL,
      upstreamHash: UPSTREAM,
      expected: 'conflict',
    },
    {
      name: 'both sides independently reached the same content',
      installedHash: BASE,
      localHash: UPSTREAM,
      upstreamHash: UPSTREAM,
      expected: 'unchanged',
    },
    {
      name: 'new upstream file, not yet on disk',
      upstreamHash: UPSTREAM,
      expected: 'new-upstream',
    },
    {
      name: 'new upstream file already present and matching',
      localHash: UPSTREAM,
      upstreamHash: UPSTREAM,
      expected: 'unchanged',
    },
    {
      name: 'new upstream file clashes with an unrelated local file',
      localHash: LOCAL,
      upstreamHash: UPSTREAM,
      expected: 'conflict',
    },
    {
      name: 'upstream removed a previously installed file',
      installedHash: BASE,
      localHash: BASE,
      expected: 'removed-upstream',
    },
    {
      name: 'local file deleted but still shipped upstream',
      installedHash: BASE,
      upstreamHash: UPSTREAM,
      expected: 'missing-locally',
    },
    {
      name: 'local file deleted and upstream still at baseline',
      installedHash: BASE,
      upstreamHash: BASE,
      expected: 'missing-locally',
    },
  ];

  for (const c of cases) {
    it(c.name, () => {
      expect(
        classifyFileStatus({
          installedHash: c.installedHash,
          localHash: c.localHash,
          upstreamHash: c.upstreamHash,
        })
      ).toBe(c.expected);
    });
  }
});

describe('hasChanges / hasConflicts', () => {
  function diff(statuses: FileStatus[]): ComponentDiff {
    return {
      name: 'widget',
      files: statuses.map((status, i) => ({ path: `f${i}.ts`, status })),
    };
  }

  it('hasChanges is false when every file is unchanged', () => {
    expect(hasChanges(diff(['unchanged', 'unchanged']))).toBe(false);
  });

  it('hasChanges is true for any non-unchanged status', () => {
    expect(hasChanges(diff(['unchanged', 'locally-modified']))).toBe(true);
    expect(hasChanges(diff(['upstream-changed']))).toBe(true);
    expect(hasChanges(diff(['new-upstream']))).toBe(true);
  });

  it('hasConflicts is true only when a conflict is present', () => {
    expect(hasConflicts(diff(['upstream-changed', 'locally-modified']))).toBe(false);
    expect(hasConflicts(diff(['conflict']))).toBe(true);
    expect(hasConflicts(diff(['unchanged', 'conflict', 'upstream-changed']))).toBe(true);
  });
});

describe('computeComponentDiff', () => {
  beforeEach(() => {
    vi.mocked(fetchIndex).mockClear();
    vi.mocked(fetchItem).mockClear();
  });

  const tracked: LockFile = {
    version: 1,
    components: {
      button: {
        tier: 'free',
        installedAt: '2026-01-01T00:00:00.000Z',
        files: { 'button.ts': 'abc' },
      },
    },
  };

  it('returns not-tracked without consulting the index or the network', async () => {
    const result = await computeComponentDiff('button', '/tmp', { version: 1, components: {} }, []);
    expect(result.error).toMatch(/not tracked/);
    expect(fetchIndex).not.toHaveBeenCalled();
    expect(fetchItem).not.toHaveBeenCalled();
  });

  it('uses the caller-provided index instead of fetching it per component', async () => {
    const result = await computeComponentDiff('button', '/tmp', tracked, []);
    expect(result.error).toMatch(/no longer available upstream/);
    expect(fetchIndex).not.toHaveBeenCalled();
    expect(fetchItem).not.toHaveBeenCalled();
  });
});
