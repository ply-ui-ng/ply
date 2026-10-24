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
  'list_components browses the catalog by tier, category, or substring. search_components ranks a fuzzy match when the name is uncertain. get_component reads one known name. init_project creates missing project files. add_components installs named components into a project that already has ply-ui.json. update_components refreshes tracked copies. diff_components reports that drift and writes nothing. doctor checks setup. The hosted catalog cannot write files. When PLY_LICENSE_KEY is already set, leave it in the environment and out of the tool call.';

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
        `List Ply registry components filtered by tier, category, or a case-insensitive substring, sorted by name. Not a fuzzy match: search_components ranks uncertain names, and get_component reads one known name. Does not install. To copy a component into a project, tell the user to run ${CLI_NPX} add <name>.`,
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
        `Get registry metadata for one known component (deps, category, file list). Use search_components when the name is uncertain. Free source only when includeSource=true. Pro source is never streamed via MCP. Does not install; returns installCommand (${CLI_NPX} add <name>).`,
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
        `Rank Ply registry components by a fuzzy or token match when the name is uncertain (for example "dialog modal"). Not a category browse: list_components filters by tier, category, or substring, and get_component reads one known name. Does not install. To copy a match into a project, tell the user to run ${CLI_NPX} add <name> (or local stdio add_components).`,
      inputSchema: searchComponentsInput,
      annotations: catalogAnnotations,
    },
    async (args) => searchComponents(args)
  );

  registerResources(server);
  return server;
}
