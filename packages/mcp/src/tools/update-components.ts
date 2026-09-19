import { z } from 'zod';
import { resolveProjectCwd, runCli } from '../cli';
import { isSafeItemName } from '../registry';
import { failJson, okJson } from '../result';
import { CLI_BIN } from '../brand';

export const updateComponentsInput = {
  names: z
    .array(z.string().min(1))
    .optional()
    .describe(
      'Tracked component names to update. Omit or pass [] to update every component in ply-ui-lock.json.'
    ),
  cwd: z
    .string()
    .optional()
    .describe(
      'Project root containing ply-ui.json (defaults to MCP process cwd / PLY_CWD)'
    ),
  force: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'On conflict (both local and upstream changed), take the upstream version. Does not revert local-only edits.'
    ),
  overwriteLocal: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'Also revert files you edited that upstream did not change (`--overwrite-local`). Default skips those files.'
    ),
  merge: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'On conflict, apply a 3-way merge using the installed snapshot (`--merge`). force still wins.'
    ),
};

/**
 * Always non-interactive (`update --yes`). Conflicts are skipped unless `force`.
 * Local-only edits are skipped unless `overwriteLocal`.
 */
export async function updateComponents(
  args: {
    names?: string[];
    cwd?: string;
    force?: boolean;
    overwriteLocal?: boolean;
    merge?: boolean;
  } = {}
) {
  try {
    const cwd = resolveProjectCwd(args.cwd);
    const names = (args.names ?? []).map((n) => n.trim()).filter(Boolean);
    for (const name of names) {
      if (!isSafeItemName(name)) {
        return failJson(`Invalid component name: '${name}'.`);
      }
    }

    const cliArgs = ['update', ...names, '--yes'];
    if (args.force) cliArgs.push('--force');
    if (args.overwriteLocal) cliArgs.push('--overwrite-local');
    if (args.merge) cliArgs.push('--merge');

    const result = await runCli(cliArgs, { cwd });
    if (!result.ok) {
      return failJson(`${CLI_BIN} update failed.`, {
        cwd,
        names,
        exitCode: result.code,
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim(),
        hint: 'Run diff_components first. Conflicts need --force; local-only edits need overwriteLocal.',
      });
    }

    return okJson({
      ok: true,
      cwd,
      names: names.length ? names : 'all-tracked',
      force: Boolean(args.force),
      overwriteLocal: Boolean(args.overwriteLocal),
      merge: Boolean(args.merge),
      cli: [CLI_BIN, ...cliArgs].join(' '),
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim() || undefined,
      note: `Files were written by ${CLI_BIN} (canonical updater). MCP does not replace the CLI.`,
    });
  } catch (err: any) {
    return failJson(err.message || String(err));
  }
}
