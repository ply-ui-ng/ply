import { describe, expect, it } from 'vitest';
import { handleMcpFetch } from './web';

describe('Web-standard MCP fetch', () => {
  it('serves health JSON on GET /', async () => {
    const res = await handleMcpFetch(new Request('https://mcp.ply-ui.com/'));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; mcp: string; mutating: boolean };
    expect(json.ok).toBe(true);
    expect(json.mcp).toBe('/mcp');
    expect(json.mutating).toBe(false);
  });

  it('serves an HTML landing page for browsers on GET /mcp', async () => {
    const res = await handleMcpFetch(
      new Request('https://mcp.ply-ui.com/mcp', {
        headers: { Accept: 'text/html' },
      })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/text\/html/);
    const html = await res.text();
    expect(html).toContain('https://mcp.ply-ui.com/mcp');
  });

  it('requires a bearer token on /mcp when configured', async () => {
    const denied = await handleMcpFetch(new Request('https://mcp.ply-ui.com/mcp', { method: 'POST', body: '{}' }), {
      authToken: 'secret',
    });
    expect(denied.status).toBe(401);

    const allowed = await handleMcpFetch(
      new Request('https://mcp.ply-ui.com/mcp', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer secret',
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' }),
      }),
      { authToken: 'secret' }
    );
    expect(allowed.status).not.toBe(401);
  });

  it('answers initialize over Streamable HTTP', async () => {
    const res = await handleMcpFetch(
      new Request('https://mcp.ply-ui.com/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-03-26',
            capabilities: {},
            clientInfo: { name: 'test', version: '0.0.1' },
          },
        }),
      })
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { result?: { serverInfo?: { name: string } } };
    expect(body.result?.serverInfo?.name).toBe('ply');
  });

  it('lists catalog tools as read-only', async () => {
    const res = await handleMcpFetch(
      new Request('https://mcp.ply-ui.com/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
      })
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      result?: { tools?: { name: string; annotations?: { readOnlyHint?: boolean } }[] };
    };
    const tools = body.result?.tools ?? [];
    const names = tools.map((t) => t.name);
    expect(names).toEqual(expect.arrayContaining(['list_components', 'search_components', 'get_component']));
    expect(names).not.toContain('add_components');
    for (const name of ['list_components', 'search_components', 'get_component']) {
      const tool = tools.find((t) => t.name === name);
      expect(tool?.annotations?.readOnlyHint).toBe(true);
    }
  });
});
