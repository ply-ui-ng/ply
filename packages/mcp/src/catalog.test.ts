import { describe, expect, it } from 'vitest';
import { createCatalogMcpServer, SERVER_INSTRUCTIONS } from './catalog';
import { createMcpServer } from './server';
import { searchComponentsInput } from './tools/search-components';

describe('server instructions', () => {
  it('puts one instructions string on the catalog server', () => {
    const server = createCatalogMcpServer();
    expect((server.server as { _instructions?: string })._instructions).toBe(SERVER_INSTRUCTIONS);
    expect(SERVER_INSTRUCTIONS).toContain('add_components');
    expect(SERVER_INSTRUCTIONS).toContain('diff_components');
    expect(SERVER_INSTRUCTIONS).not.toContain('then add_components');
    expect(SERVER_INSTRUCTIONS).toContain('PLY_LICENSE_KEY');
    expect(searchComponentsInput.limit.description).toBe(
      'Maximum ranked matches to return (1-40). Defaults to 12.'
    );
  });

  it('keeps that string when mutating tools are registered', () => {
    const server = createMcpServer();
    expect((server.server as { _instructions?: string })._instructions).toBe(SERVER_INSTRUCTIONS);
    const tools = (server as unknown as { _registeredTools: Record<string, { outputSchema?: unknown }> })
      ._registeredTools;
    expect(tools.doctor.outputSchema).toBeTruthy();
    expect(tools.add_components.outputSchema).toBeTruthy();
    expect(tools.update_components.outputSchema).toBeTruthy();
    expect(tools.diff_components.outputSchema).toBeTruthy();
  });
});
