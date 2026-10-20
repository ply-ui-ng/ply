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
  refreshEditorKit: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'Replace an editor kit that is already there (Cursor rule, snippets, and the design skill in .cursor/skills and .agents/skills). Maps to `init --refresh-editor-kit`.'
    ),
};

export async function initProject(args: { cwd?: string; refreshEditorKit?: boolean } = {}) {
  try {
    const cwd = resolveProjectCwd(args.cwd);
    const cliArgs = ['init', '--yes'];
    if (args.refreshEditorKit) cliArgs.push('--refresh-editor-kit');
    const result = await runCli(cliArgs, { cwd });
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
      cli: [CLI_BIN, ...cliArgs].join(' '),
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim() || undefined,
    });
  } catch (err: any) {
    return failJson(err.message || String(err));
  }
}
