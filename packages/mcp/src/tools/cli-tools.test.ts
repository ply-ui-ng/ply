import { beforeEach, describe, expect, it, vi } from 'vitest';

const runCli = vi.fn();

vi.mock('../cli', () => ({
  resolveProjectCwd: (cwd?: string) => cwd || '/tmp/app',
  runCli: (...args: unknown[]) => runCli(...args),
}));

import { doctor } from './doctor';
import { diffComponents } from './diff-components';
import { initProject } from './init-project';
import { updateComponents } from './update-components';

function body(result: { content: { type: string; text?: string }[] }) {
  return JSON.parse(result.content[0].text || '{}');
}

describe('MCP Week 2 CLI tools', () => {
  beforeEach(() => {
    runCli.mockReset();
    runCli.mockResolvedValue({ ok: true, code: 0, stdout: 'ok', stderr: '' });
  });

  it('init_project always passes --yes', async () => {
    const result = await initProject({ cwd: '/apps/shop' });
    expect(runCli).toHaveBeenCalledWith(['init', '--yes'], { cwd: '/apps/shop' });
    expect(result.isError).toBeUndefined();
    expect(body(result).cli).toBe('ply-ui-cli init --yes');
  });

  it('doctor is an error when the CLI exits non-zero', async () => {
    runCli.mockResolvedValue({
      ok: false,
      code: 1,
      stdout: 'missing ply-ui.json',
      stderr: '',
    });
    const result = await doctor({ cwd: '/apps/shop' });
    expect(result.isError).toBe(true);
    expect(body(result).exitCode).toBe(1);
    expect(runCli).toHaveBeenCalledWith(['doctor'], { cwd: '/apps/shop' });
  });

  it('diff_components with no names diffs every tracked component', async () => {
    await diffComponents({});
    expect(runCli).toHaveBeenCalledWith(['diff'], { cwd: '/tmp/app' });
  });

  it('diff_components rejects unsafe names without spawning the CLI', async () => {
    const result = await diffComponents({ names: ['../evil'] });
    expect(result.isError).toBe(true);
    expect(runCli).not.toHaveBeenCalled();
  });

  it('update_components always passes --yes and optional flags', async () => {
    await updateComponents({
      names: ['button'],
      cwd: '/apps/shop',
      force: true,
      overwriteLocal: true,
    });
    expect(runCli).toHaveBeenCalledWith(
      ['update', 'button', '--yes', '--force', '--overwrite-local'],
      { cwd: '/apps/shop' }
    );
  });

  it('update_components passes --merge', async () => {
    await updateComponents({ names: ['button'], merge: true });
    expect(runCli).toHaveBeenCalledWith(['update', 'button', '--yes', '--merge'], {
      cwd: '/tmp/app',
    });
  });
});
