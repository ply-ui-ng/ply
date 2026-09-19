import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createCatalogMcpServer } from './catalog';
import { PACKAGE_VERSION } from './version';
import { CLI_NPX, MCP_PACKAGE, MCP_NPX } from './brand';

export interface McpFetchOptions {
  authToken?: string;
}

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, MCP-Protocol-Version',
};

function withCors(res: Response): Response {
  const headers = new Headers(res.headers);
  for (const [key, value] of Object.entries(CORS)) {
    headers.set(key, value);
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

function json(body: unknown, status = 200): Response {
  return withCors(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  );
}

function wantsHtml(request: Request): boolean {
  return (request.headers.get('accept') || '').includes('text/html');
}

const HEALTH = {
  ok: true,
  name: MCP_PACKAGE,
  version: PACKAGE_VERSION,
  transport: 'streamable-http',
  mcp: '/mcp',
  mutating: false,
};

const LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ply MCP</title>
  <style>
    body { font: 16px/1.45 system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1.25rem; color: #0f172a; }
    code { font: 0.9em ui-monospace, monospace; background: #f1f5f9; padding: 0.1em 0.35em; border-radius: 4px; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <h1>Ply MCP</h1>
  <p>This host is a <strong>read-only catalog</strong> for ChatGPT and other remote MCP clients. It is not a website and it cannot install files into a repo.</p>
  <p>Connector URL: <code>https://mcp.ply-ui.com/mcp</code></p>
  <p>Install in a project: <code>${CLI_NPX} add &lt;name&gt;</code></p>
  <p>Health JSON: <a href="/"><code>GET /</code></a></p>
  <p>Install and mutate a project with local stdio: <code>${MCP_NPX}</code></p>
  <p><a href="https://ply-ui.com/getting-started/#ai-agents-mcp">Setup docs</a></p>
</body>
</html>`;

/**
 * Web-standard Streamable HTTP MCP (Cloudflare Workers, Node 18+ fetch).
 * Always catalog-only — no CLI spawn.
 */
export async function handleMcpFetch(
  request: Request,
  options: McpFetchOptions = {}
): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (url.pathname === '/' && request.method === 'GET') {
    if (wantsHtml(request)) {
      return withCors(
        new Response(LANDING_HTML, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      );
    }
    return json(HEALTH);
  }

  if (url.pathname !== '/mcp') {
    return json({ error: 'Not found. MCP is POST/GET /mcp.' }, 404);
  }

  if (request.method === 'GET' && wantsHtml(request)) {
    return withCors(
      new Response(LANDING_HTML, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    );
  }

  const token = options.authToken?.trim();
  if (token) {
    const header = request.headers.get('authorization');
    if (header !== `Bearer ${token}`) {
      return json({ error: 'Unauthorized' }, 401);
    }
  }

  try {
    const mcp = createCatalogMcpServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await mcp.connect(transport);
    return withCors(await transport.handleRequest(request));
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
}
