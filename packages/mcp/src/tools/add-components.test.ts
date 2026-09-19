import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const runCli = vi.fn();

vi.mock('../cli', () => ({
  resolveProjectCwd: (cwd?: string) => cwd || '/tmp/app',
  runCli: (...args: unknown[]) => runCli(...args),
}));

vi.mock('../registry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../registry')>();
  return {
    ...actual,
    fetchIndex: vi.fn(),
  };
});

import { fetchIndex } from '../registry';
import { addComponents } from './add-components';

const mockedIndex = vi.mocked(fetchIndex);

function body(result: { content: { type: string; text?: string }[] }) {
  return JSON.parse(result.content[0].text || '{}');
}

const index = [
  {
    name: 'button',
    tier: 'free' as const,
    category: 'component' as const,
    dependencies: [],
    registryDependencies: [],
  },
  {
    name: 'drawer',
    tier: 'free' as const,
    category: 'component' as const,
    dependencies: [],
    registryDependencies: [],
  },
  {
    name: 'chart',
    tier: 'pro' as const,
    category: 'widget' as const,
    dependencies: [],
    registryDependencies: [],
  },
];

describe('add_components Pro + aliases', () => {
  beforeEach(() => {
    runCli.mockReset();
    runCli.mockResolvedValue({ ok: true, code: 0, stdout: 'ok', stderr: '' });
    mockedIndex.mockReset();
    mockedIndex.mockResolvedValue(index);
    delete process.env.PLY_LICENSE_KEY;
    delete process.env.BASE_UI_LICENSE_KEY;
  });

  afterEach(() => {
    delete process.env.PLY_LICENSE_KEY;
    delete process.env.BASE_UI_LICENSE_KEY;
  });

  it('rejects Pro names without a license key', async () => {
    const result = await addComponents({ names: ['chart'] });
    expect(result.isError).toBe(true);
    expect(body(result).pro).toEqual(['chart']);
    expect(runCli).not.toHaveBeenCalled();
  });

  it('installs Pro when licenseKey is passed', async () => {
    const result = await addComponents({ names: ['chart'], licenseKey: 'lic_test' });
    expect(result.isError).toBeUndefined();
    expect(runCli).toHaveBeenCalledWith(['add', 'chart', '--yes'], {
      cwd: '/tmp/app',
      env: { PLY_LICENSE_KEY: 'lic_test', BASE_UI_LICENSE_KEY: 'lic_test' },
    });
  });

  it('installs Pro when PLY_LICENSE_KEY is set', async () => {
    process.env.PLY_LICENSE_KEY = 'env_key';
    await addComponents({ names: ['chart'] });
    expect(runCli).toHaveBeenCalledWith(['add', 'chart', '--yes'], {
      cwd: '/tmp/app',
      env: { PLY_LICENSE_KEY: 'env_key', BASE_UI_LICENSE_KEY: 'env_key' },
    });
  });

  it('installs Pro when BASE_UI_LICENSE_KEY is set', async () => {
    process.env.BASE_UI_LICENSE_KEY = 'legacy_key';
    await addComponents({ names: ['chart'] });
    expect(runCli).toHaveBeenCalledWith(['add', 'chart', '--yes'], {
      cwd: '/tmp/app',
      env: { PLY_LICENSE_KEY: 'legacy_key', BASE_UI_LICENSE_KEY: 'legacy_key' },
    });
  });

  it('resolves sheet → drawer before install', async () => {
    await addComponents({ names: ['sheet'] });
    expect(runCli).toHaveBeenCalledWith(['add', 'drawer', '--yes'], {
      cwd: '/tmp/app',
      env: undefined,
    });
  });
});
