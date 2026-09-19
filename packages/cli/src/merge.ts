import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

export interface ThreeWayMergeResult {
  /** True when git produced a clean merge (no leftover conflict markers). */
  clean: boolean;
  text: string;
  /** Set when git merge-file is unavailable. */
  error?: string;
}

/**
 * Three-way merge using `git merge-file`. Ancestor is the lockfile snapshot
 * (the bytes that were installed). Falls back to conflict markers if git
 * is missing.
 */
export function mergeThreeWay(args: {
  ancestor: string;
  local: string;
  upstream: string;
}): ThreeWayMergeResult {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'base-ui-merge-'));
  const ancestorPath = path.join(dir, 'ancestor');
  const localPath = path.join(dir, 'local');
  const upstreamPath = path.join(dir, 'upstream');
  try {
    fs.writeFileSync(ancestorPath, args.ancestor, 'utf8');
    fs.writeFileSync(localPath, args.local, 'utf8');
    fs.writeFileSync(upstreamPath, args.upstream, 'utf8');
    const result = spawnSync(
      'git',
      ['merge-file', '-p', '--diff3', localPath, ancestorPath, upstreamPath],
      { encoding: 'utf8' }
    );
    if (result.error) {
      return {
        clean: false,
        text: conflictMarkers(args),
        error: result.error.message,
      };
    }
    const text = result.stdout ?? '';
    // git merge-file exits 1+ when conflict markers remain.
    return { clean: result.status === 0, text };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function conflictMarkers(args: { ancestor: string; local: string; upstream: string }): string {
  return (
    `<<<<<<< local\n${args.local}` +
    (args.local.endsWith('\n') ? '' : '\n') +
    `||||||| ancestor\n${args.ancestor}` +
    (args.ancestor.endsWith('\n') ? '' : '\n') +
    `=======\n${args.upstream}` +
    (args.upstream.endsWith('\n') ? '' : '\n') +
    `>>>>>>> upstream\n`
  );
}
