import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { CLI_PACKAGE } from './brand';

/**
 * Resolve the ply-ui-cli entrypoint.
 * Order: PLY_CLI_PATH → local monorepo dist → node_modules bin → npx.
 */
export function resolveCliEntrypoint(): { command: string; argsPrefix: string[] } {
  const envPath = process.env.PLY_CLI_PATH?.trim() || process.env.BASE_UI_CLI_PATH?.trim();
  if (envPath && fs.existsSync(envPath)) {
    return { command: process.execPath, argsPrefix: [envPath] };
  }

  const sibling = path.resolve(__dirname, '../../cli/dist/index.js');
  if (fs.existsSync(sibling)) {
    return { command: process.execPath, argsPrefix: [sibling] };
  }

  for (const pkg of [CLI_PACKAGE, 'base-ui-cli']) {
    try {
      const pkgJson = require.resolve(`${pkg}/package.json`);
      const bin = path.join(path.dirname(pkgJson), 'dist', 'index.js');
      if (fs.existsSync(bin)) {
        return { command: process.execPath, argsPrefix: [bin] };
      }
    } catch {
      // not installed as a dependency
    }
  }

  // npx.cmd is named directly so the child process never needs a shell — see
  // the spawn call below, which deliberately does not set `shell`.
  return { command: process.platform === 'win32' ? 'npx.cmd' : 'npx', argsPrefix: ['-y', CLI_PACKAGE] };
}

export interface RunCliResult {
  ok: boolean;
  code: number | null;
  stdout: string;
  stderr: string;
}

export function runCli(
  cliArgs: string[],
  options: { cwd: string; env?: NodeJS.ProcessEnv; timeoutMs?: number } = { cwd: process.cwd() }
): Promise<RunCliResult> {
  const { command, argsPrefix } = resolveCliEntrypoint();
  const args = [...argsPrefix, ...cliArgs];
  const timeoutMs = options.timeoutMs ?? 120_000;

  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env, FORCE_COLOR: '0' },
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGTERM');
      resolve({
        ok: false,
        code: null,
        stdout,
        stderr: stderr + `\nTimed out after ${timeoutMs}ms`,
      });
    }, timeoutMs);

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });
    child.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ ok: false, code: null, stdout, stderr: err.message });
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ ok: code === 0, code, stdout, stderr });
    });
  });
}

/** Project root for mutating tools (init/add). Prefer explicit cwd, else process cwd. */
export function resolveProjectCwd(cwd?: string): string {
  const root = cwd?.trim() || process.env.PLY_CWD?.trim() || process.env.BASE_UI_CWD?.trim() || process.cwd();
  return path.resolve(root);
}
