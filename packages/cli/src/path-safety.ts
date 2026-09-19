import path from 'path';

/** Reject registry payload file names that could escape the target directory. */
export function isSafeFileName(name: string): boolean {
  if (path.isAbsolute(name) || /^[a-zA-Z]:[\\/]/.test(name)) return false;
  const segments = name.split(/[\\/]/);
  return segments.every((s) => s !== '' && s !== '..');
}
