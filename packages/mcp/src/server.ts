import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createCatalogMcpServer } from './catalog';
import { confirmReplace } from './elicit';
import { addComponents, addComponentsInput, addOutput } from './tools/add-components';
import { diffComponents, diffComponentsInput } from './tools/diff-components';
import { doctor, doctorInput, doctorOutput } from './tools/doctor';
import { initProject, initProjectInput } from './tools/init-project';
import { updateComponents, updateComponentsInput, updateOutput } from './tools/update-components';
import { CLI_BIN } from './brand';

export { PACKAGE_VERSION } from './version';

export interface CreateMcpServerOptions {
  /** When false, mutating CLI tools are omitted (hosted catalog MCP). */
  mutating?: boolean;
}

export function createMcpServer(options: CreateMcpServerOptions = {}): McpServer {
  const mutating = options.mutating !== false;
  const server = createCatalogMcpServer();

  const readOnlyAnnotations = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  } as const;
  const writeAnnotations = {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: false,
  } as const;

  if (mutating) {
    server.registerTool(
      'add_components',
      {
        title: 'Add Ply components',
        description:
          `Install registry components by shelling to \`${CLI_BIN} add --yes\`. --yes leaves an existing component in place; pass overwrite to replace it. Hosts that can ask confirm that overwrite first. Pro names require PLY_LICENSE_KEY (or licenseKey). Project must already have ply-ui.json. structuredContent includes missingPackages and installCommand.`,
        inputSchema: addComponentsInput,
        outputSchema: addOutput,
        annotations: writeAnnotations,
      },
      async (args) =>
        addComponents(args, {
          confirmReplace: (message) => confirmReplace(server, message),
        })
    );

    server.registerTool(
      'init_project',
      {
        title: 'Initialize Ply in a project',
        description:
          `Run \`${CLI_BIN} init --yes\` in the target directory. Writes ply-ui.json, ply-ui.css, and icon sprites only when those files are missing, discovers the stylesheet already listed in angular.json, and inserts @source when it is absent. Writes the design skill to .cursor/skills and .agents/skills when those files are missing. Pass refreshEditorKit to replace an existing editor kit. Always non-interactive.`,
        inputSchema: initProjectInput,
        annotations: writeAnnotations,
      },
      async (args) => initProject(args)
    );

    server.registerTool(
      'doctor',
      {
        title: 'Verify Ply project setup',
        description:
          `Run \`${CLI_BIN} doctor\` (read-only). structuredContent.checks lists each ✔/⚠/✖ line. Returns isError when the CLI exits non-zero.`,
        inputSchema: doctorInput,
        outputSchema: doctorOutput,
        annotations: readOnlyAnnotations,
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
        annotations: readOnlyAnnotations,
      },
      async (args) => diffComponents(args)
    );

    server.registerTool(
      'update_components',
      {
        title: 'Update installed Ply components',
        description:
          `Run \`${CLI_BIN} update --yes\`. Untouched files take upstream. Conflicts stay local and the CLI exits non-zero unless force or merge. Local-only edits skip unless overwriteLocal. Hosts that can ask confirm force and overwriteLocal before those flags replace files. structuredContent.files is one result per file line.`,
        inputSchema: updateComponentsInput,
        outputSchema: updateOutput,
        annotations: writeAnnotations,
      },
      async (args) =>
        updateComponents(args, {
          confirmReplace: (message) => confirmReplace(server, message),
        })
    );
  }

  return server;
}
