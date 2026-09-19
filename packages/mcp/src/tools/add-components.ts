import { z } from 'zod';
import { resolveProjectCwd, runCli } from '../cli';
import {
  SITE_URL,
  fetchIndex,
  isSafeItemName,
  suggestNames,
} from '../registry';
import { failJson, okJson } from '../result';
import { canonicalComponentName } from '../aliases';
import { CLI_BIN, CLI_NPX } from '../brand';

export const addComponentsInput = {
  names: z
    .array(z.string().min(1))
    .min(1)
    .describe('One or more registry component names to install (aliases like sheet → drawer are resolved)'),
  cwd: z
    .string()
    .optional()
    .describe(
      'Project root containing ply-ui.json (defaults to MCP process cwd / PLY_CWD / BASE_UI_CWD)'
    ),
  overwrite: z
    .boolean()
    .optional()
    .default(false)
    .describe('Overwrite existing component folders (maps to CLI --overwrite)'),
  licenseKey: z
    .string()
    .optional()
    .describe(
      'Ply Pro license. Prefer PLY_LICENSE_KEY (or BASE_UI_LICENSE_KEY) in the MCP server env instead of putting a key in chat.'
    ),
};

/**
 * Installs registry components via the CLI. Pro names require
 * `licenseKey` or `PLY_LICENSE_KEY` / `BASE_UI_LICENSE_KEY`.
 */
export async function addComponents(args: {
  names: string[];
  cwd?: string;
  overwrite?: boolean;
  licenseKey?: string;
}) {
  try {
    const cwd = resolveProjectCwd(args.cwd);
    const names = [
      ...new Set(
        args.names
          .map((n) => canonicalComponentName(n.trim()))
          .filter(Boolean)
      ),
    ];

    if (!names.length) {
      return failJson('Provide at least one component name.');
    }

    for (const name of names) {
      if (!isSafeItemName(name)) {
        return failJson(`Invalid component name: '${name}'.`);
      }
    }

    const index = await fetchIndex();
    const byName = new Map(index.map((i) => [i.name, i]));
    const unknown: string[] = [];
    const pro: string[] = [];
    const free: string[] = [];

    for (const name of names) {
      const entry = byName.get(name);
      if (!entry) {
        unknown.push(name);
        continue;
      }
      if (entry.tier === 'pro') {
        pro.push(name);
      } else {
        free.push(name);
      }
    }

    if (unknown.length) {
      return failJson('Unknown component name(s).', {
        unknown,
        suggestions: unknown.flatMap((n) =>
          suggestNames(
            n,
            index.map((i) => i.name),
            3
          )
        ),
      });
    }

    const licenseKey =
      args.licenseKey?.trim() ||
      process.env.PLY_LICENSE_KEY?.trim() ||
      process.env.BASE_UI_LICENSE_KEY?.trim() ||
      '';

    if (pro.length && !licenseKey) {
      return failJson(
        `Pro components need PLY_LICENSE_KEY (or licenseKey): ${pro.join(', ')}.`,
        {
          pro,
          pricingUrl: `${SITE_URL}/pricing`,
          note: 'Set PLY_LICENSE_KEY on the MCP server process (BASE_UI_LICENSE_KEY still works), then retry. Free components can still be added with this tool.',
          freeCandidates: free,
        }
      );
    }

    // Also reject if free items pull Pro registryDependencies (closure).
    const queue = [...free];
    const seen = new Set<string>();
    const proDeps: string[] = [];
    while (queue.length) {
      const name = queue.shift()!;
      if (seen.has(name)) continue;
      seen.add(name);
      const entry = byName.get(name);
      if (!entry) continue;
      if (entry.tier === 'pro') {
        proDeps.push(name);
        continue;
      }
      queue.push(...entry.registryDependencies);
    }
    if (proDeps.length && !licenseKey) {
      return failJson(
        `Install blocked: free selection depends on Pro components: ${proDeps.join(', ')}.`,
        {
          proDependencies: proDeps,
          pricingUrl: `${SITE_URL}/pricing`,
        }
      );
    }

    const toInstall = [...free, ...pro];
    const cliArgs = ['add', ...toInstall, '--yes'];
    if (args.overwrite) cliArgs.push('--overwrite');

    const result = await runCli(cliArgs, {
      cwd,
      env: licenseKey
        ? { PLY_LICENSE_KEY: licenseKey, BASE_UI_LICENSE_KEY: licenseKey }
        : undefined,
    });
    if (!result.ok) {
      return failJson(`${CLI_BIN} add failed.`, {
        cwd,
        names: toInstall,
        exitCode: result.code,
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim(),
        hint: `Ensure the project was initialized (${CLI_NPX} init --yes). CLI remains the canonical install path.`,
      });
    }

    return okJson({
      ok: true,
      cwd,
      installed: toInstall,
      cli: `${CLI_BIN} add --yes`,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim() || undefined,
      note: `Files were written by ${CLI_BIN} (canonical installer). MCP does not replace the CLI.`,
    });
  } catch (err: any) {
    return failJson(err.message || String(err));
  }
}
