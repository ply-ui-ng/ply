import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerResources } from './resources';
import { getComponent, getComponentInput } from './tools/get-component';
import { listComponents, listComponentsInput } from './tools/list-components';
import { searchComponents, searchComponentsInput } from './tools/search-components';
import { PACKAGE_VERSION } from './version';
import { CLI_NPX, MCP_SERVER_NAME } from './brand';

/**
 * One instructions string for every Ply server. Hosted catalog and local
 * install share it. It is not a second llms.txt.
 */
export const SERVER_INSTRUCTIONS =
  'Search the catalog before inventing a component name. The hosted catalog cannot write files. A local install is init_project, then add_components. When PLY_LICENSE_KEY is already set, leave it in the environment and out of the tool call.';

/** ChatGPT treats tools as writes unless readOnlyHint is set. */
const catalogAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
} as const;

/** Catalog-only server: safe to bundle on Cloudflare Workers (no child_process). */
export function createCatalogMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: MCP_SERVER_NAME,
      version: PACKAGE_VERSION,
    },
    { instructions: SERVER_INSTRUCTIONS },
  );

  server.registerTool(
    'list_components',
    {
      title: 'List Ply components',
      description:
        `List components from the Ply registry. Filter by tier (free|pro|all), category, or name substring. Does not install anything. To copy a component into a project, tell the user to run ${CLI_NPX} add <name>.`,
      inputSchema: listComponentsInput,
      annotations: catalogAnnotations,
    },
    async (args) => listComponents(args)
  );

  server.registerTool(
    'get_component',
    {
      title: 'Get component details',
      description:
        `Get registry metadata for one component (deps, category, file list). Free source only when includeSource=true. Pro source is never streamed via MCP. Does not install; returns installCommand (${CLI_NPX} add <name>).`,
      inputSchema: getComponentInput,
      annotations: catalogAnnotations,
    },
    async (args) => getComponent(args)
  );

  server.registerTool(
    'search_components',
    {
      title: 'Search Ply components',
      description:
        `Fuzzy / token search over registry component names (e.g. "dialog", "sheet", "carousel"). Does not install anything. Prefer this before guessing names, then give the user ${CLI_NPX} add <name> (or local stdio add_components).`,
      inputSchema: searchComponentsInput,
      annotations: catalogAnnotations,
    },
    async (args) => searchComponents(args)
  );

  registerResources(server);
  return server;
}
