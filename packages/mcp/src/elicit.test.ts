import { describe, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { confirmReplace, resolveReplace } from './elicit';

function host(elicitInput: (...args: unknown[]) => Promise<unknown>): McpServer {
  return { server: { elicitInput } } as unknown as McpServer;
}

describe('confirmReplace', () => {
  it('replaces only when the form is accepted with replace true', async () => {
    const elicitInput = vi.fn().mockResolvedValue({ action: 'accept', content: { replace: true } });
    await expect(confirmReplace(host(elicitInput), 'Replace button?')).resolves.toBe('replace');
    expect(elicitInput).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'form', message: 'Replace button?' }),
    );
  });

  it('keeps files when the host declines or the box stays unchecked', async () => {
    await expect(
      confirmReplace(host(async () => ({ action: 'decline' })), 'Replace?'),
    ).resolves.toBe('keep');
    await expect(
      confirmReplace(host(async () => ({ action: 'accept', content: { replace: false } })), 'Replace?'),
    ).resolves.toBe('keep');
  });

  it('leaves an explicit flag in place when the host cannot ask', async () => {
    await expect(
      confirmReplace(
        host(async () => {
          throw new Error('Client does not support form elicitation.');
        }),
        'Replace?',
      ),
    ).resolves.toBe('unsupported');
  });

  it('does not treat a validation failure as permission to overwrite', async () => {
    await expect(
      confirmReplace(
        host(async () => {
          throw new Error('Elicitation response content does not match requested schema');
        }),
        'Replace?',
      ),
    ).rejects.toThrow(/does not match/);
  });
});

describe('resolveReplace', () => {
  it('skips the prompt when replace was not requested', async () => {
    const confirm = vi.fn();
    await expect(resolveReplace(false, confirm, 'Replace?')).resolves.toEqual({ apply: false });
    expect(confirm).not.toHaveBeenCalled();
  });

  it('drops the flag when the person declines', async () => {
    await expect(resolveReplace(true, async () => 'keep', 'Replace?')).resolves.toEqual({
      apply: false,
      confirmation: 'declined',
    });
  });
});
