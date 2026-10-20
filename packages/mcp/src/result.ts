import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

function asRecord(data: unknown): Record<string, unknown> | undefined {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return undefined;
}

export function okJson(data: unknown): CallToolResult {
  const structuredContent = asRecord(data);
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    ...(structuredContent ? { structuredContent } : {}),
  };
}

export function failJson(
  message: string,
  extra: Record<string, unknown> = {}
): CallToolResult {
  const structuredContent = { ok: false, error: message, ...extra };
  return {
    isError: true,
    structuredContent,
    content: [
      {
        type: 'text',
        text: JSON.stringify(structuredContent, null, 2),
      },
    ],
  };
}
