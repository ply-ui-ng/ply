import { describe, expect, it } from 'vitest';
import { hashContent, recordComponent, type LockFile } from './lockfile';

describe('hashContent', () => {
  it('is deterministic for the same input', () => {
    expect(hashContent('hello')).toBe(hashContent('hello'));
  });

  it('changes when content changes', () => {
    expect(hashContent('hello')).not.toBe(hashContent('hello!'));
  });

  it('returns a 64-char hex sha256', () => {
    expect(hashContent('x')).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('recordComponent', () => {
  it('stores per-file hashes and overwrites a previous entry', () => {
    const lock: LockFile = { version: 1, components: {} };
    recordComponent(lock, 'card', 'free', [
      { name: 'card.ts', content: 'v1' },
      { name: 'card.html', content: '<div/>' },
    ]);
    expect(lock.components.card.tier).toBe('free');
    expect(lock.components.card.files['card.ts']).toBe(hashContent('v1'));
    expect(lock.components.card.files['card.html']).toBe(hashContent('<div/>'));

    recordComponent(lock, 'card', 'pro', [{ name: 'card.ts', content: 'v2' }]);
    expect(lock.components.card.tier).toBe('pro');
    expect(lock.components.card.files).toEqual({
      'card.ts': hashContent('v2'),
    });
  });
});
