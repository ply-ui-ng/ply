import fs from 'fs';
import path from 'path';
import { diffLines } from './vendor';
import { fetchItem, RegistryIndexEntry, RegistryItem } from './registry';
import { LockFile, hashContent, LOCKFILE_NAME } from './lockfile';
import { readSnapshot } from './snapshot';
import { CLI_NPX } from './brand';

export type FileStatus =
  /** local, installed, and upstream content all match. */
  | 'unchanged'
  /** you haven't touched it; upstream has a new version — safe to auto-update. */
  | 'upstream-changed'
  /** you edited it; upstream hasn't changed since you installed it. Nothing to pull. */
  | 'locally-modified'
  /** both you and upstream changed it, differently. Needs a decision. */
  | 'conflict'
  /** file didn't exist when you installed; upstream added it since. */
  | 'new-upstream'
  /** file was part of the component when you installed it; upstream no longer ships it. */
  | 'removed-upstream'
  /** upstream still ships it, but the local file is gone (you deleted it). */
  | 'missing-locally';

export interface FileDiff {
  /** path relative to the component's install directory */
  path: string;
  status: FileStatus;
  localContent?: string;
  upstreamContent?: string;
  /** Installed bytes from `.ply-ui/snapshots` when the hash still matches the lockfile. */
  ancestorContent?: string;
}

export interface ComponentDiff {
  name: string;
  tier?: 'free' | 'pro';
  /** set when the component can't be compared at all (not tracked, fetch failed, license missing, removed upstream) */
  error?: string;
  files: FileDiff[];
}

export function hasChanges(diff: ComponentDiff): boolean {
  return diff.files.some((f) => f.status !== 'unchanged');
}

/** Files that need a human decision (can't be safely auto-applied or safely ignored). */
export function hasConflicts(diff: ComponentDiff): boolean {
  return diff.files.some((f) => f.status === 'conflict');
}

/**
 * Three-way classify: lockfile hash (installed baseline) vs local vs upstream.
 * Pure — no I/O — so the matrix can be unit-tested without a registry.
 *
 * - `installedHash` missing → file is new to us (added upstream after install).
 * - `localHash` missing → file is gone on disk.
 * - `upstreamHash` missing → file is gone from the registry.
 */
export function classifyFileStatus(args: {
  installedHash?: string;
  localHash?: string;
  upstreamHash?: string;
}): FileStatus {
  const { installedHash, localHash, upstreamHash } = args;

  if (installedHash === undefined) {
    // New to us: upstream added this file after we installed the component.
    if (localHash === undefined) return 'new-upstream';
    if (localHash === upstreamHash) {
      // Already matches upstream — nothing to write. `update` backfills
      // the lockfile entry for this file so it's tracked from here on;
      // `diff` is read-only and leaves the lockfile untouched.
      return 'unchanged';
    }
    return 'conflict'; // local has an unrelated file at this path
  }

  if (upstreamHash === undefined) return 'removed-upstream';
  if (localHash === undefined) return 'missing-locally';
  if (localHash === installedHash && upstreamHash === installedHash) return 'unchanged';
  if (localHash === installedHash) return 'upstream-changed';
  if (upstreamHash === installedHash) return 'locally-modified';
  if (localHash === upstreamHash) return 'unchanged'; // both ended up the same, coincidentally
  return 'conflict';
}

/**
 * Compare one installed component's on-disk state against the upstream
 * registry, using the lockfile as the common ancestor (three-way: local vs
 * installed-baseline vs upstream).
 *
 * Callers must fetch the registry index once (`fetchIndex()`) and pass it in.
 * This function still fetches the individual item payload.
 *
 * @example
 * const index = await fetchIndex();
 * for (const name of targets) {
 *   await computeComponentDiff(name, componentsRoot, lock, index);
 * }
 */
export async function computeComponentDiff(
  name: string,
  componentsRoot: string,
  lock: LockFile,
  index: RegistryIndexEntry[]
): Promise<ComponentDiff> {
  const lockEntry = lock.components[name];
  if (!lockEntry) {
    return {
      name,
      files: [],
      error: `not tracked in ${LOCKFILE_NAME} — run "${CLI_NPX} add ${name} --overwrite" to start tracking it.`,
    };
  }

  const indexEntry = index.find((i) => i.name === name);
  if (!indexEntry) {
    return { name, tier: lockEntry.tier, files: [], error: 'no longer available upstream (removed from the registry).' };
  }

  let upstream: RegistryItem;
  try {
    upstream = await fetchItem(name, indexEntry.tier, indexEntry.digest);
  } catch (err: any) {
    return { name, tier: indexEntry.tier, files: [], error: err.message };
  }

  const upstreamFiles = new Map(upstream.files.map((f) => [f.name, f.content]));
  const paths = new Set<string>([...Object.keys(lockEntry.files), ...upstreamFiles.keys()]);

  const files: FileDiff[] = [];
  for (const relPath of paths) {
    const localPath = path.join(componentsRoot, name, relPath);
    const localExists = fs.existsSync(localPath);
    const localContent = localExists ? fs.readFileSync(localPath, 'utf8') : undefined;
    const localHash = localContent !== undefined ? hashContent(localContent) : undefined;

    const installedHash = lockEntry.files[relPath];
    const upstreamContent = upstreamFiles.get(relPath);
    const upstreamHash = upstreamContent !== undefined ? hashContent(upstreamContent) : undefined;

    const status = classifyFileStatus({ installedHash, localHash, upstreamHash });
    const ancestorContent =
      status === 'conflict' ? readSnapshot(name, relPath, installedHash) : undefined;
    files.push({ path: relPath, status, localContent, upstreamContent, ancestorContent });
  }

  files.sort((a, b) => a.path.localeCompare(b.path));
  return { name, tier: indexEntry.tier, files };
}

const STATUS_LABEL: Record<FileStatus, string> = {
  unchanged: 'unchanged',
  'upstream-changed': 'updated upstream',
  'locally-modified': 'locally modified (no upstream change)',
  conflict: 'CONFLICT — both changed',
  'new-upstream': 'new upstream file',
  'removed-upstream': 'removed upstream',
  'missing-locally': 'upstream changed, but your local file is missing',
};

export function statusLabel(status: FileStatus): string {
  return STATUS_LABEL[status];
}

const RED = (s: string) => `\x1b[31m${s}\x1b[0m`;
const GREEN = (s: string) => `\x1b[32m${s}\x1b[0m`;
const DIM = (s: string) => `\x1b[2m${s}\x1b[0m`;

/** Renders a readable, colorized unified-ish diff between two file contents. */
export function renderDiff(oldContent: string | undefined, newContent: string | undefined): string {
  const parts = diffLines(oldContent ?? '', newContent ?? '');
  const lines: string[] = [];
  for (const part of parts) {
    const prefix = part.added ? '+' : part.removed ? '-' : ' ';
    const color = part.added ? GREEN : part.removed ? RED : DIM;
    const partLines = part.value.replace(/\n$/, '').split('\n');
    for (const line of partLines) {
      lines.push(color(`${prefix} ${line}`));
    }
  }
  return lines.join('\n');
}
