import { describe, expect, it, vi } from 'vitest';
import { add } from './add';

describe('add without names', () => {
  it('exits when --yes is set so CI and agents do not hang', async () => {
    process.exitCode = 0;
    const errors: string[] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((msg?: unknown) => {
      errors.push(String(msg ?? ''));
    });
    try {
      await add([], { yes: true });
      expect(process.exitCode).toBe(1);
      expect(errors.join('\n')).toContain('npx ply-ui-cli add <name>');
      expect(errors.join('\n')).toContain('without --yes');
    } finally {
      spy.mockRestore();
      process.exitCode = 0;
    }
  });
});
