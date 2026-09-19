import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createCatalogMcpServer } from './catalog';
import { addComponents, addComponentsInput } from './tools/add-components';
import { diffComponents, diffComponentsInput } from './tools/diff-components';
import { doctor, doctorInput } from './tools/doctor';
import { initProject, initProjectInput } from './tools/init-project';
import { updateComponents, updateComponentsInput } from './tools/update-components';
import { CLI_BIN } from './brand';

export { PACKAGE_VERSION } from './version';

export interface CreateMcpServerOptions {
  /** When false, mutating CLI tools are omitted (hosted catalog MCP). */
  mutating?: boolean;
}

export function createMcpServer(options: CreateMcpServerOptions = {}): McpServer {
  const mutating = options.mutating !== false;
  const server = createCatalogMcpServer();

  if (mutating) {
    server.registerTool(
      'add_components',
      {
        title: 'Add Ply components',
        description:
          `Install registry components by shelling to \`${CLI_BIN} add --yes\`. Pro names require PLY_LICENSE_KEY (or licenseKey). Project must already have ply-ui.json.`,
        inputSchema: addComponentsInput,
      },
      async (args) => addComponents(args)
    );

    server.registerTool(
      'init_project',
      {
        title: 'Initialize Ply in a project',
        description:
          `Run \`${CLI_BIN} init --yes\` in the target directory (writes ply-ui.json, styles, icons, editor rules). Always non-interactive.`,
        inputSchema: initProjectInput,
      },
      async (args) => initProject(args)
    );

    server.registerTool(
      'doctor',
      {
        title: 'Verify Ply project setup',
        description:
          `Run \`${CLI_BIN} doctor\` (read-only). Returns isError when the CLI exits non-zero.`,
        inputSchema: doctorInput,
      },
      async (args) => doctor(args)
    );

    server.registerTool(
      'diff_components',
      {
        title: 'Diff installed Ply components',
        description:
          `Run \`${CLI_BIN} diff\` against tracked components. Read-only. Omit names to check everything in ply-ui-lock.json.`,
        inputSchema: diffComponentsInput,
      },
      async (args) => diffComponents(args)
    );

    server.registerTool(
      'update_components',
      {
        title: 'Update installed Ply components',
        description:
          `Run \`${CLI_BIN} update --yes\`. Untouched files take upstream. Conflicts skip unless force or merge. Local-only edits skip unless overwriteLocal.`,
        inputSchema: updateComponentsInput,
      },
      async (args) => updateComponents(args)
    );
  }

  return server;
}
