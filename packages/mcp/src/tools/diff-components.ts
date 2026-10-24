import { z } from 'zod';
import { resolveProjectCwd, runCli } from '../cli';
import { diffOutput, parseDiffFiles } from '../cli-report';
import { isSafeItemName } from '../registry';
import { failJson, okJson } from '../result';
import { CLI_BIN } from '../brand';

export { diffOutput };

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
    const stdout = result.stdout.trim();
    const body = {
      cwd,
      names: names.length ? names : 'all-tracked',
      cli: names.length ? `${CLI_BIN} diff ${names.join(' ')}` : `${CLI_BIN} diff`,
      stdout,
      stderr: result.stderr.trim() || undefined,
      files: parseDiffFiles(stdout),
      note: 'Writes nothing. update_components applies these upstream changes.',
    };
    if (!result.ok) {
      return failJson(`${CLI_BIN} diff failed.`, {
        ...body,
        exitCode: result.code,
        hint: 'Project must be initialized and components tracked in ply-ui-lock.json.',
      });
    }

    return okJson({ ok: true, ...body });
  } catch (err: any) {
    return failJson(err.message || String(err));
  }
}
