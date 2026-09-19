import fs from 'fs';
import path from 'path';

/** Canonical project files written by `init`. Legacy `base-ui.*` names still resolve. */
export const CONFIG_FILE = 'ply-ui.json';
export const LEGACY_CONFIG_FILE = 'base-ui.json';
export const CSS_FILE = 'ply-ui.css';
export const LEGACY_CSS_FILE = 'base-ui.css';
export const LOCKFILE_NAME = 'ply-ui-lock.json';
export const LEGACY_LOCKFILE_NAME = 'base-ui-lock.json';
export const SNAPSHOT_ROOT = '.ply-ui/snapshots';
export const LEGACY_SNAPSHOT_ROOT = '.base-ui/snapshots';
export const CURSOR_RULE_REL = '.cursor/rules/ply-ui.mdc';
export const SNIPPETS_REL = '.vscode/ply-ui.code-snippets';
export const DOCS_CURSOR_RULE = 'docs/ai/ply-ui.mdc';
export const DOCS_SNIPPETS = 'docs/ai/ply-ui.code-snippets';

export function firstExisting(cwd: string, names: string[]): string | null {
  for (const name of names) {
    const resolved = path.resolve(cwd, name);
    if (fs.existsSync(resolved)) return resolved;
  }
  return null;
}

export function configFilePath(cwd = process.cwd()): string | null {
  return firstExisting(cwd, [CONFIG_FILE, LEGACY_CONFIG_FILE]);
}

export function lockfilePath(cwd = process.cwd()): string {
  return (
    firstExisting(cwd, [LOCKFILE_NAME, LEGACY_LOCKFILE_NAME]) ||
    path.resolve(cwd, LOCKFILE_NAME)
  );
}

export function cssImportCandidates(): string[] {
  return [`@import './${CSS_FILE}'`, `@import './${LEGACY_CSS_FILE}'`];
}
