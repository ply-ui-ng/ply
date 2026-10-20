import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export type ReplaceDecision = 'replace' | 'keep' | 'unsupported';

export interface ReplaceResolution {
  apply: boolean;
  confirmation?: 'accepted' | 'declined' | 'unsupported';
}

/**
 * Ask a host that supports form elicitation before an overwrite.
 * Hosts that cannot ask leave the explicit flag in place.
 */
export async function confirmReplace(server: McpServer, message: string): Promise<ReplaceDecision> {
  try {
    const result = await server.server.elicitInput({
      mode: 'form',
      message,
      requestedSchema: {
        type: 'object',
        properties: {
          replace: {
            type: 'boolean',
            title: 'Replace existing files',
            description: 'Overwrite the copies already in the project.',
            default: false,
          },
        },
        required: ['replace'],
      },
    });
    if (result.action === 'accept' && result.content?.replace === true) return 'replace';
    return 'keep';
  } catch (err) {
    const text = err instanceof Error ? err.message : String(err);
    if (text.includes('does not support form elicitation')) return 'unsupported';
    throw err;
  }
}

export async function resolveReplace(
  requested: boolean,
  confirm: ((message: string) => Promise<ReplaceDecision>) | undefined,
  message: string,
): Promise<ReplaceResolution> {
  if (!requested) return { apply: false };
  if (!confirm) return { apply: true };
  const decision = await confirm(message);
  if (decision === 'keep') return { apply: false, confirmation: 'declined' };
  if (decision === 'unsupported') return { apply: true, confirmation: 'unsupported' };
  return { apply: true, confirmation: 'accepted' };
}
