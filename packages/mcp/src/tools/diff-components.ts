import { z } from 'zod';
import { resolveProjectCwd, runCli } from '../cli';
import { isSafeItemName } from '../registry';
import { failJson, okJson } from '../result';
import { CLI_BIN } from '../brand';

export const diffComponentsInput = {
  names: z
    .array(z.string().min(1))
    .optional()
    .describe(
      'Tracked component names to diff. Omit or pass [] to check every component in ply-ui-lock.json.'
    ),
  cwd: z
    .string()
    .optional()
    .describe(
      'Project root containing ply-ui.json (defaults to MCP process cwd / PLY_CWD)'
    ),
};

export async function diffComponents(args: { names?: string[]; cwd?: string } = {}) {
  try {
    const cwd = resolveProjectCwd(args.cwd);
    const names = (args.names ?? []).map((n) => n.trim()).filter(Boolean);
    for (const name of names) {
      if (!isSafeItemName(name)) {
        return failJson(`Invalid component name: '${name}'.`);
      }
    }

    const cliArgs = names.length ? ['diff', ...names] : ['diff'];
    const result = await runCli(cliArgs, { cwd });
    if (!result.ok) {
      return failJson(`${CLI_BIN} diff failed.`, {
        cwd,
        names,
        exitCode: result.code,
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim(),
        hint: 'Project must be initialized and components tracked in ply-ui-lock.json.',
      });
    }

    return okJson({
      ok: true,
      cwd,
      names: names.length ? names : 'all-tracked',
      cli: names.length ? `${CLI_BIN} diff ${names.join(' ')}` : `${CLI_BIN} diff`,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim() || undefined,
      note: 'Read-only. Use update_components to apply upstream changes.',
    });
  } catch (err: any) {
    return failJson(err.message || String(err));
  }
}
