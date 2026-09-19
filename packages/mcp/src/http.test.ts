import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { startHttpServer } from './http';

describe('Streamable HTTP MCP', () => {
  const servers: ReturnType<typeof startHttpServer>[] = [];

  afterEach(async () => {
    await Promise.all(
      servers.splice(0).map(
        (server) =>
          new Promise<void>((resolve, reject) => {
            server.close((err) => (err ? reject(err) : resolve()));
          })
      )
    );
  });

  async function listen(opts: Parameters<typeof startHttpServer>[0]) {
    const server = startHttpServer(opts);
    servers.push(server);
    await once(server, 'listening');
    const addr = server.address() as AddressInfo;
    return `http://127.0.0.1:${addr.port}`;
  }

  it('serves a health document on GET /', async () => {
    const origin = await listen({ host: '127.0.0.1', port: 0, readOnly: true });
    const res = await fetch(`${origin}/`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; mcp: string; mutating: boolean };
    expect(json.ok).toBe(true);
    expect(json.mcp).toBe('/mcp');
    expect(json.mutating).toBe(false);
  });

  it('requires a bearer token on /mcp when configured', async () => {
    const origin = await listen({
      host: '127.0.0.1',
      port: 0,
      readOnly: true,
      authToken: 'secret',
    });
    const denied = await fetch(`${origin}/mcp`, { method: 'POST', body: '{}' });
    expect(denied.status).toBe(401);

    const allowed = await fetch(`${origin}/mcp`, {
      method: 'POST',
      headers: { Authorization: 'Bearer secret', 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' }),
    });
    expect(allowed.status).not.toBe(401);
  });
});
