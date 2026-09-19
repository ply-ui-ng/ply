import { describe, expect, it } from 'vitest';
import { isSafeFileName } from './path-safety';

describe('isSafeFileName', () => {
  it('allows normal relative paths', () => {
    expect(isSafeFileName('widget.component.ts')).toBe(true);
    expect(isSafeFileName('sub/dir/file.ts')).toBe(true);
  });

  it('rejects path traversal', () => {
    expect(isSafeFileName('../evil.ts')).toBe(false);
    expect(isSafeFileName('foo/../../evil.ts')).toBe(false);
    expect(isSafeFileName('..\\evil.ts')).toBe(false);
  });

  it('rejects absolute paths', () => {
    expect(isSafeFileName('/etc/passwd')).toBe(false);
    expect(isSafeFileName('C:\\Windows\\system32')).toBe(false);
    expect(isSafeFileName('C:/Windows/system32')).toBe(false);
  });

  it('rejects empty path segments', () => {
    expect(isSafeFileName('')).toBe(false);
    expect(isSafeFileName('foo//bar.ts')).toBe(false);
  });
});
