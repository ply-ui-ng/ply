import { describe, expect, it } from 'vitest';
import { mergeThreeWay } from './merge';

describe('mergeThreeWay', () => {
  it('takes both non-overlapping edits', () => {
    const ancestor = 'a\nb\nc\n';
    const local = 'A\nb\nc\n';
    const upstream = 'a\nb\nC\n';
    const result = mergeThreeWay({ ancestor, local, upstream });
    expect(result.clean).toBe(true);
    expect(result.text).toBe('A\nb\nC\n');
  });

  it('leaves markers when both sides change the same line', () => {
    const ancestor = 'same\n';
    const local = 'mine\n';
    const upstream = 'theirs\n';
    const result = mergeThreeWay({ ancestor, local, upstream });
    expect(result.clean).toBe(false);
    expect(result.text).toContain('<<<<<<<');
    expect(result.text).toContain('mine');
    expect(result.text).toContain('theirs');
  });
});
