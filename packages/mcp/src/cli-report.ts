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

const STATUS: Record<string, DoctorCheck['status']> = {
  '✔': 'ok',
  '⚠': 'warn',
  '✖': 'error',
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
