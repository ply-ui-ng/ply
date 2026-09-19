import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { hashContent, writeLockFile } from '../lockfile';
import type { ComponentDiff } from '../sync';

vi.mock('../registry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../registry')>();
  return {
    ...actual,
    fetchIndex: vi.fn(async () => [
      {
        name: 'button',
        tier: 'free',
        category: 'component',
        dependencies: [],
        registryDependencies: [],
      },
    ]),
  };
});

vi.mock('../sync', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../sync')>();
  return {
    ...actual,
    computeComponentDiff: vi.fn(),
  };
});

import { computeComponentDiff } from '../sync';
import { update } from './update';

const mockedDiff = vi.mocked(computeComponentDiff);

function tempProject(): { cwd: string; file: string } {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'base-ui-update-'));
  fs.writeFileSync(
    path.join(cwd, 'ply-ui.json'),
    JSON.stringify({ aliases: { components: 'src/app/components' } })
  );
  const dir = path.join(cwd, 'src/app/components/button');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'button.ts');
  fs.writeFileSync(file, 'LOCAL');
  return { cwd, file };
}

describe('update --overwrite-local', () => {
  let origCwd: string;

  beforeEach(() => {
    origCwd = process.cwd();
    process.exitCode = 0;
    mockedDiff.mockReset();
  });

  afterEach(() => {
    process.chdir(origCwd);
    process.exitCode = 0;
    vi.restoreAllMocks();
  });

  function lockAndChdir(cwd: string) {
    process.chdir(cwd);
    writeLockFile({
      version: 1,
      components: {
        button: {
          tier: 'free',
          installedAt: '2026-01-01T00:00:00.000Z',
          files: { 'button.ts': hashContent('UPSTREAM') },
        },
      },
    });
  }

  function localOnlyDiff(): ComponentDiff {
    return {
      name: 'button',
      files: [
        {
          path: 'button.ts',
          status: 'locally-modified',
          localContent: 'LOCAL',
          upstreamContent: 'UPSTREAM',
        },
      ],
    };
  }

  it('keeps local-only edits unless --overwrite-local is set', async () => {
    const { cwd, file } = tempProject();
    lockAndChdir(cwd);
    mockedDiff.mockResolvedValue(localOnlyDiff());

    await update([], { yes: true });
    expect(fs.readFileSync(file, 'utf8')).toBe('LOCAL');
  });

  it('writes the lock baseline when --overwrite-local is set', async () => {
    const { cwd, file } = tempProject();
    lockAndChdir(cwd);
    mockedDiff.mockResolvedValue(localOnlyDiff());

    await update([], { yes: true, overwriteLocal: true });
    expect(fs.readFileSync(file, 'utf8')).toBe('UPSTREAM');
  });

  it('still applies untouched upstream changes without --overwrite-local', async () => {
    const { cwd, file } = tempProject();
    fs.writeFileSync(file, 'UPSTREAM');
    lockAndChdir(cwd);
    mockedDiff.mockResolvedValue({
      name: 'button',
      files: [
        {
          path: 'button.ts',
          status: 'upstream-changed',
          localContent: 'UPSTREAM',
          upstreamContent: 'NEW',
        },
      ],
    });

    await update([], { yes: true });
    expect(fs.readFileSync(file, 'utf8')).toBe('NEW');
  });
});

describe('update --merge', () => {
  let origCwd: string;

  beforeEach(() => {
    origCwd = process.cwd();
    process.exitCode = 0;
    mockedDiff.mockReset();
  });

  afterEach(() => {
    process.chdir(origCwd);
    process.exitCode = 0;
    vi.restoreAllMocks();
  });

  function lockAndChdir(cwd: string) {
    process.chdir(cwd);
    writeLockFile({
      version: 1,
      components: {
        button: {
          tier: 'free',
          installedAt: '2026-01-01T00:00:00.000Z',
          files: { 'button.ts': hashContent('a\nb\nc\n') },
        },
      },
    });
  }

  it('applies a clean 3-way merge on conflict', async () => {
    const { cwd, file } = tempProject();
    fs.writeFileSync(file, 'A\nb\nc\n');
    lockAndChdir(cwd);
    mockedDiff.mockResolvedValue({
      name: 'button',
      files: [
        {
          path: 'button.ts',
          status: 'conflict',
          localContent: 'A\nb\nc\n',
          upstreamContent: 'a\nb\nC\n',
          ancestorContent: 'a\nb\nc\n',
        },
      ],
    });

    await update([], { yes: true, merge: true });
    expect(fs.readFileSync(file, 'utf8')).toBe('A\nb\nC\n');
    expect(process.exitCode).toBe(0);
  });

  it('exits 1 when the merge leaves conflict markers', async () => {
    const { cwd, file } = tempProject();
    fs.writeFileSync(file, 'mine\n');
    lockAndChdir(cwd);
    mockedDiff.mockResolvedValue({
      name: 'button',
      files: [
        {
          path: 'button.ts',
          status: 'conflict',
          localContent: 'mine\n',
          upstreamContent: 'theirs\n',
          ancestorContent: 'same\n',
        },
      ],
    });

    await update([], { yes: true, merge: true });
    expect(fs.readFileSync(file, 'utf8')).toContain('<<<<<<<');
    expect(process.exitCode).toBe(1);
  });

  it('skips merge when no ancestor snapshot is available', async () => {
    const { cwd, file } = tempProject();
    fs.writeFileSync(file, 'LOCAL');
    lockAndChdir(cwd);
    mockedDiff.mockResolvedValue({
      name: 'button',
      files: [
        {
          path: 'button.ts',
          status: 'conflict',
          localContent: 'LOCAL',
          upstreamContent: 'UPSTREAM',
        },
      ],
    });

    await update([], { yes: true, merge: true });
    expect(fs.readFileSync(file, 'utf8')).toBe('LOCAL');
  });
});
