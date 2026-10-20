import { z } from 'zod';
import { resolveProjectCwd, runCli } from '../cli';
import { parseDoctorChecks, doctorOutput } from '../cli-report';
import { failJson, okJson } from '../result';
import { CLI_BIN } from '../brand';

export { doctorOutput };

export const doctorInput = {
  cwd: z
    .string()
    .optional()
    .describe(
      'Project root containing ply-ui.json (defaults to MCP process cwd / PLY_CWD). Read-only.'
    ),
};

export async function doctor(args: { cwd?: string } = {}) {
  try {
    const cwd = resolveProjectCwd(args.cwd);
    const result = await runCli(['doctor'], { cwd });
    const stdout = result.stdout.trim();
    const body = {
      cwd,
      cli: `${CLI_BIN} doctor`,
      exitCode: result.code,
      stdout,
      stderr: result.stderr.trim() || undefined,
      checks: parseDoctorChecks(stdout),
    };
    if (!result.ok) {
      return failJson(`${CLI_BIN} doctor reported problems.`, body);
    }
    return okJson({ ok: true, ...body });
  } catch (err: any) {
    return failJson(err.message || String(err));
  }
}
