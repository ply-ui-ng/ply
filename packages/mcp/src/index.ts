#!/usr/bin/env node
/**
 * ply-ui-mcp — MCP server wrapping the Ply registry + CLI.
 *
 * Default: stdio (Cursor, Claude Code/Desktop, Kimi, VS Code, Windsurf).
 * `--http`: Streamable HTTP for ChatGPT / Gemini chat apps and remote MCP URLs.
 * Hosted HTTP should use `--read-only` so catalog tools work without a local project.
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer, PACKAGE_VERSION } from './server';
import { startHttpServer } from './http';
import { MCP_PACKAGE } from './brand';

function parseArgs(argv: string[]): {
  http: boolean;
  readOnly: boolean;
  port: number;
  host: string;
} {
  let http =
    argv.includes('--http') ||
    process.env.PLY_MCP_HTTP === '1' ||
    process.env.BASE_UI_MCP_HTTP === '1';
  let readOnly =
    argv.includes('--read-only') ||
    process.env.PLY_MCP_READ_ONLY === '1' ||
    process.env.BASE_UI_MCP_READ_ONLY === '1';
  let port = Number(process.env.PORT || process.env.PLY_MCP_PORT || process.env.BASE_UI_MCP_PORT || 3334);
  let host = process.env.PLY_MCP_HOST || process.env.BASE_UI_MCP_HOST || (http ? '127.0.0.1' : '127.0.0.1');
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--port' && argv[i + 1]) {
      port = Number(argv[++i]);
    } else if (arg?.startsWith('--port=')) {
      port = Number(arg.slice('--port='.length));
    } else if (arg === '--host' && argv[i + 1]) {
      host = argv[++i]!;
    } else if (arg?.startsWith('--host=')) {
      host = arg.slice('--host='.length);
    }
  }
  if (!Number.isFinite(port) || port <= 0) port = 3334;
  return { http, readOnly, port, host };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.http) {
    startHttpServer({
      host: opts.host,
      port: opts.port,
      readOnly: opts.readOnly,
      authToken:
        process.env.PLY_MCP_AUTH_TOKEN?.trim() ||
        process.env.BASE_UI_MCP_AUTH_TOKEN?.trim() ||
        undefined,
    });
    return;
  }

  const server = createMcpServer({ mutating: true });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`${MCP_PACKAGE} v${PACKAGE_VERSION} ready on stdio`);
}

main().catch((err) => {
  console.error(`${MCP_PACKAGE} failed to start:`, err);
  process.exit(1);
});
