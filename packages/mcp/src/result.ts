import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export function okJson(data: unknown): CallToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

export function failJson(
  message: string,
  extra: Record<string, unknown> = {}
): CallToolResult {
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: JSON.stringify({ ok: false, error: message, ...extra }, null, 2),
      },
    ],
  };
}
