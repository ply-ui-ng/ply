import { z } from 'zod';

export interface DoctorCheck {
  name: string;
  status: 'ok' | 'warn' | 'error';
  message: string;
}

export interface AddInstallReport {
  missingPackages: string[];
  installCommand?: string;
}

export interface UpdateFileResult {
  path: string;
  action: 'updated' | 'added' | 'reverted' | 'kept' | 'merged' | 'merge-conflict' | 'saved-aside';
  detail?: string;
}

export interface DiffFileResult {
  component: string;
  path: string;
  status:
    | 'upstream-changed'
    | 'locally-modified'
    | 'conflict'
    | 'new-upstream'
    | 'removed-upstream'
    | 'missing-locally';
}

const STATUS: Record<string, DoctorCheck['status']> = {
  '✔': 'ok',
  '⚠': 'warn',
  '✖': 'error',
};

const DIFF_STATUS: Record<string, DiffFileResult['status']> = {
  'updated upstream': 'upstream-changed',
  'locally modified (no upstream change)': 'locally-modified',
  'CONFLICT — both changed': 'conflict',
  'new upstream file': 'new-upstream',
  'removed upstream': 'removed-upstream',
  'upstream changed, but your local file is missing': 'missing-locally',
};

const FILE_ACTION: Record<string, UpdateFileResult['action']> = {
  '↑': 'updated',
  '+': 'added',
  '↓': 'reverted',
  '=': 'kept',
  '⋈': 'merged',
  '⚠': 'merge-conflict',
  '⇄': 'saved-aside',
};

export const doctorOutput = z.looseObject({
  ok: z.boolean(),
  checks: z.array(
    z.looseObject({
      name: z.string(),
      status: z.enum(['ok', 'warn', 'error']),
      message: z.string(),
    }),
  ),
});

export const addOutput = z.looseObject({
  ok: z.boolean(),
  missingPackages: z.array(z.string()),
  installCommand: z.string().optional(),
});

export const updateOutput = z.looseObject({
  ok: z.boolean(),
  files: z.array(
    z.looseObject({
      path: z.string(),
      action: z.enum(['updated', 'added', 'reverted', 'kept', 'merged', 'merge-conflict', 'saved-aside']),
      detail: z.string().optional(),
    }),
  ),
});

export const diffOutput = z.looseObject({
  ok: z.boolean(),
  files: z.array(
    z.looseObject({
      component: z.string(),
      path: z.string(),
      status: z.enum([
        'upstream-changed',
        'locally-modified',
        'conflict',
        'new-upstream',
        'removed-upstream',
        'missing-locally',
      ]),
    }),
  ),
});

function plain(text: string): string {
  return text.replace(/\u001b\[[0-9;]*m/g, '').replace(/\r\n/g, '\n');
}

/** Doctor prints `✔|⚠|✖ Name: message` on stdout. The summary line is ignored. */
export function parseDoctorChecks(stdout: string): DoctorCheck[] {
  const checks: DoctorCheck[] = [];
  for (const line of plain(stdout).split('\n')) {
    const match = line.match(/^([✔⚠✖])\s+([^:]+):\s*(.*)$/);
    if (!match) continue;
    const status = STATUS[match[1]];
    if (!status) continue;
    checks.push({ name: match[2].trim(), status, message: match[3].trim() });
  }
  return checks;
}

/** Add prints the package-manager command instead of running it. */
export function parseAddReport(stdout: string): AddInstallReport {
  const match = plain(stdout).match(/Install missing npm dependenc(?:y|ies):\n\s+(.+)/);
  if (!match) return { missingPackages: [] };
  const installCommand = match[1].trim();
  const packages = installCommand.match(/^(?:npm install|pnpm add|yarn add|bun add)\s+(.+)$/);
  return {
    installCommand,
    missingPackages: packages ? packages[1].split(/\s+/).filter(Boolean) : [],
  };
}

/**
 * Diff prints a component header, then `  path  —  status` for drifted files.
 * Unchanged files and patch lines are omitted.
 */
export function parseDiffFiles(stdout: string): DiffFileResult[] {
  const files: DiffFileResult[] = [];
  let component = '';
  for (const line of plain(stdout).split('\n')) {
    if (!line.trim()) continue;
    const file = line.match(/^ {2}(\S+) {2}— {2}(.+)$/);
    if (file && component) {
      const status = DIFF_STATUS[file[2].trim()];
      if (!status) continue;
      files.push({ component, path: file[1], status });
      continue;
    }
    const header = line.match(/^([a-z0-9][a-z0-9.-]*)(?: {2}\(pro\))?$/i);
    if (header && !header[1].includes('..')) component = header[1];
  }
  return files;
}

/** Update prints one indented symbol line per file it touched or skipped. */
export function parseUpdateFiles(stdout: string): UpdateFileResult[] {
  const files: UpdateFileResult[] = [];
  for (const line of plain(stdout).split('\n')) {
    const match = line.match(/^\s*([↑+↓=⋈⚠⇄])\s+(\S+)(?:\s+\((.*)\))?\s*$/);
    if (!match) continue;
    const action = FILE_ACTION[match[1]];
    if (!action) continue;
    const detail = match[3]?.trim();
    files.push(detail ? { path: match[2], action, detail } : { path: match[2], action });
  }
  return files;
}
