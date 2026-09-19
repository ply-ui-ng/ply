import fs from 'fs';
import path from 'path';
import { hashContent } from './lockfile';
import { isSafeFileName } from './path-safety';
import { LEGACY_SNAPSHOT_ROOT, SNAPSHOT_ROOT } from './paths';

function snapshotPath(component: string, file: string, root: string): string {
  return path.resolve(process.cwd(), root, component, file);
}

/** Persist the installed (ancestor) bytes so later conflicts can 3-way merge. */
export function writeSnapshot(component: string, file: string, content: string): void {
  if (!isSafeFileName(file) || !isSafeFileName(component)) return;
  const dest = snapshotPath(component, file, SNAPSHOT_ROOT);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content, 'utf8');
}

export function readSnapshot(
  component: string,
  file: string,
  expectedHash?: string
): string | undefined {
  for (const root of [SNAPSHOT_ROOT, LEGACY_SNAPSHOT_ROOT]) {
    const dest = snapshotPath(component, file, root);
    if (!fs.existsSync(dest)) continue;
    const content = fs.readFileSync(dest, 'utf8');
    if (expectedHash && hashContent(content) !== expectedHash) continue;
    return content;
  }
  return undefined;
}
