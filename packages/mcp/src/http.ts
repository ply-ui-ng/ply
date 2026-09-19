import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer, PACKAGE_VERSION } from './server';
import { MCP_PACKAGE } from './brand';

export interface HttpOptions {
  host: string;
  port: number;
  readOnly: boolean;
  authToken?: string;
}

function setCors(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version'
  );
}

function unauthorized(res: ServerResponse): void {
  setCors(res);
  res.writeHead(401, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Unauthorized' }));
}

function checkAuth(req: IncomingMessage, token?: string): boolean {
  if (!token) return true;
  const header = req.headers.authorization;
  return header === `Bearer ${token}`;
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return undefined;
  return JSON.parse(raw);
}

/**
 * Streamable HTTP MCP. ChatGPT / Gemini chat apps need a public HTTPS URL
 * pointing at `/mcp`. Mutating tools only work when this process can see
 * the consumer project (local `--http`, not a remote catalog host).
 */
export function startHttpServer(options: HttpOptions): ReturnType<typeof createServer> {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

      if (req.method === 'OPTIONS') {
        setCors(res);
        res.writeHead(204);
        res.end();
        return;
      }

      if (url.pathname === '/' && req.method === 'GET') {
        setCors(res);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: true,
            name: MCP_PACKAGE,
            version: PACKAGE_VERSION,
            transport: 'streamable-http',
            mcp: '/mcp',
            mutating: !options.readOnly,
          })
        );
        return;
      }

      if (url.pathname !== '/mcp') {
        setCors(res);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found. MCP is POST/GET /mcp.' }));
        return;
      }

      if (!checkAuth(req, options.authToken)) {
        unauthorized(res);
        return;
      }

      setCors(res);
      const mcp = createMcpServer({ mutating: !options.readOnly });
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await mcp.connect(transport);
      const parsedBody = req.method === 'POST' ? await readBody(req) : undefined;
      await transport.handleRequest(req, res, parsedBody);
    } catch (err) {
      console.error(`${MCP_PACKAGE} HTTP error:`, err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
      }
      if (!res.writableEnded) {
        res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
      }
    }
  });

  server.listen(options.port, options.host, () => {
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : options.port;
    console.error(
      `${MCP_PACKAGE} v${PACKAGE_VERSION} Streamable HTTP on http://${options.host}:${port}/mcp` +
        (options.readOnly ? ' (read-only catalog)' : '')
    );
  });
  return server;
}
