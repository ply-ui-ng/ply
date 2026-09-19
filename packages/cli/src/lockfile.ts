import fs from 'fs';
import crypto from 'crypto';
import { LOCKFILE_NAME, lockfilePath } from './paths';

export { LOCKFILE_NAME };
const LOCKFILE_VERSION = 1;

export interface LockComponent {
  tier: 'free' | 'pro';
  installedAt: string;
  /** relative file path (as installed) -> sha256 of the content fetched from the registry */
  files: Record<string, string>;
}

export interface LockFile {
  version: number;
  components: Record<string, LockComponent>;
}

export function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

export function readLockFile(): LockFile {
  const p = lockfilePath();
  if (!fs.existsSync(p)) {
    return { version: LOCKFILE_VERSION, components: {} };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (parsed && typeof parsed === 'object' && parsed.components) {
      return { version: parsed.version ?? LOCKFILE_VERSION, components: parsed.components };
    }
  } catch {
    // fall through to a fresh lockfile — better to start clean than crash on a corrupt file
  }
  return { version: LOCKFILE_VERSION, components: {} };
}

export function writeLockFile(lock: LockFile): void {
  fs.writeFileSync(lockfilePath(), JSON.stringify(lock, null, 2) + '\n', 'utf8');
}

/** Record (or overwrite) the installed-file hashes for one component. */
export function recordComponent(
  lock: LockFile,
  name: string,
  tier: 'free' | 'pro',
  files: { name: string; content: string }[]
): void {
  const fileHashes: Record<string, string> = {};
  for (const f of files) {
    fileHashes[f.name] = hashContent(f.content);
  }
  lock.components[name] = {
    tier,
    installedAt: new Date().toISOString(),
    files: fileHashes,
  };
}
