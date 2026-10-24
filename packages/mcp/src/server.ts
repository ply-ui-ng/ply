import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createCatalogMcpServer } from './catalog';
import { confirmReplace } from './elicit';
import { addComponents, addComponentsInput, addOutput } from './tools/add-components';
import { diffComponents, diffComponentsInput, diffOutput } from './tools/diff-components';
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
          `Install named registry components into a project that already has ply-ui.json (\`${CLI_BIN} add --yes\`). init_project creates that file; update_components refreshes tracked copies. --yes leaves an existing folder in place; pass overwrite to replace it. Hosts that can ask confirm that overwrite first. Pro names require PLY_LICENSE_KEY (or licenseKey). structuredContent includes missingPackages and installCommand.`,
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
          `Create missing Ply setup files (\`${CLI_BIN} init --yes\`): ply-ui.json, ply-ui.css, icon sprites, @source, and the design skill in .cursor/skills and .agents/skills, and only when those files are absent. Existing project files stay. refreshEditorKit is the only replacement: it overwrites an editor kit that is already there. add_components installs named components once ply-ui.json exists; update_components refreshes tracked copies. Always non-interactive.`,
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
          `Check Ply project setup: ply-ui.json, Angular and CDK, Tailwind v4 and @source, ply-ui.css, and icon sprites. @source problems are warnings. File drift against the registry is diff_components, which writes nothing. Does not install or modify files. Returns isError when the CLI exits non-zero.`,
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
          `Compare each tracked Ply component file with the registry and return drifted paths and statuses. Writes nothing. update_components applies those upstream changes. doctor checks project setup, not file contents.`,
        inputSchema: diffComponentsInput,
        outputSchema: diffOutput,
        annotations: readOnlyAnnotations,
      },
      async (args) => diffComponents(args)
    );

    server.registerTool(
      'update_components',
      {
        title: 'Update installed Ply components',
        description:
          `Apply upstream changes to tracked Ply component copies (\`${CLI_BIN} update --yes\`). diff_components reports the same drift and writes nothing. Untouched files take upstream. Conflicts stay local and the CLI exits non-zero unless force or merge. Local-only edits skip unless overwriteLocal. Hosts that can ask confirm force and overwriteLocal before those flags replace files. structuredContent.files is one result per file line.`,
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
