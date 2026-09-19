import { z } from 'zod';
import { resolveProjectCwd, runCli } from '../cli';
import { failJson, okJson } from '../result';
import { CLI_BIN, CLI_NPX } from '../brand';

export const initProjectInput = {
  cwd: z
    .string()
    .optional()
    .describe(
      'Project root to initialize (defaults to MCP process cwd / PLY_CWD). Always non-interactive (`init --yes`).'
    ),
};

export async function initProject(args: { cwd?: string } = {}) {
  try {
    const cwd = resolveProjectCwd(args.cwd);
    const result = await runCli(['init', '--yes'], { cwd });
    if (!result.ok) {
      return failJson(`${CLI_BIN} init failed.`, {
        cwd,
        exitCode: result.code,
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim(),
        hint: `CLI remains the canonical installer: ${CLI_NPX} init --yes`,
      });
    }
    return okJson({
      ok: true,
      cwd,
      cli: `${CLI_BIN} init --yes`,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim() || undefined,
    });
  } catch (err: any) {
    return failJson(err.message || String(err));
  }
}
