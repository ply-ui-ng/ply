import { z } from 'zod';
import { resolveProjectCwd, runCli } from '../cli';
import { isSafeItemName } from '../registry';
import { parseUpdateFiles, updateOutput } from '../cli-report';
import { resolveReplace, type ReplaceDecision } from '../elicit';
import { failJson, okJson } from '../result';
import { CLI_BIN } from '../brand';

export { updateOutput };

export interface UpdateComponentsHooks {
  confirmReplace?: (message: string) => Promise<ReplaceDecision>;
}

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
  } = {},
  hooks: UpdateComponentsHooks = {},
) {
  try {
    const cwd = resolveProjectCwd(args.cwd);
    const names = (args.names ?? []).map((n) => n.trim()).filter(Boolean);
    for (const name of names) {
      if (!isSafeItemName(name)) {
        return failJson(`Invalid component name: '${name}'.`);
      }
    }

    const target = names.length ? names.join(', ') : 'tracked components';
    const replace = await resolveReplace(
      Boolean(args.force || args.overwriteLocal),
      hooks.confirmReplace,
      `Replace local files while updating ${target}? This overwrites copies already in the project.`,
    );
    const cliArgs = ['update', ...names, '--yes'];
    if (args.force && replace.apply) cliArgs.push('--force');
    if (args.overwriteLocal && replace.apply) cliArgs.push('--overwrite-local');
    if (args.merge) cliArgs.push('--merge');

    const result = await runCli(cliArgs, { cwd });
    const stdout = result.stdout.trim();
    const files = parseUpdateFiles(stdout);
    const note = [
      `Files were written by ${CLI_BIN} (canonical updater). MCP does not replace the CLI.`,
      replace.confirmation === 'declined'
        ? 'Replace was not confirmed. Conflicts and local-only edits were left in place.'
        : '',
    ]
      .filter(Boolean)
      .join(' ');
    if (!result.ok) {
      return failJson(`${CLI_BIN} update failed.`, {
        cwd,
        names,
        exitCode: result.code,
        stdout,
        stderr: result.stderr.trim(),
        files,
        ...(replace.confirmation ? { confirmation: replace.confirmation } : {}),
        hint: 'Run diff_components first. Conflicts need --force; local-only edits need overwriteLocal.',
      });
    }

    return okJson({
      ok: true,
      cwd,
      names: names.length ? names : 'all-tracked',
      force: Boolean(args.force && replace.apply),
      overwriteLocal: Boolean(args.overwriteLocal && replace.apply),
      merge: Boolean(args.merge),
      cli: [CLI_BIN, ...cliArgs].join(' '),
      stdout,
      stderr: result.stderr.trim() || undefined,
      files,
      ...(replace.confirmation ? { confirmation: replace.confirmation } : {}),
      note,
    });
  } catch (err: any) {
    return failJson(err.message || String(err));
  }
}
