import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  SITE_URL,
  fetchFreeItem,
  fetchIndex,
  fetchText,
  isSafeItemName,
} from './registry';
import { utf8ByteLength } from './utf8';

export function registerResources(server: McpServer) {
  server.registerResource(
    'registry-index',
    'ply-ui://registry/index',
    {
      title: 'Registry index',
      description: 'Public Ply registry index (names, tiers, categories, description, usage, keywords, deps)',
      mimeType: 'application/json',
    },
    async (uri) => {
      const index = await fetchIndex();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(index, null, 2),
          },
        ],
      };
    }
  );

  server.registerResource(
    'docs-llms',
    'ply-ui://docs/llms',
    {
      title: 'llms.txt',
      description:
        'Agent-oriented product overview (keep fetching this URL even when MCP is available)',
      mimeType: 'text/plain',
    },
    async (uri) => {
      const text = await fetchText(`${SITE_URL}/llms.txt`);
      return {
        contents: [{ uri: uri.href, mimeType: 'text/plain', text }],
      };
    }
  );

  server.registerResource(
    'docs-catalog',
    'ply-ui://docs/catalog',
    {
      title: 'AI component catalog',
      description: 'docs/ai/components.md — detailed component reference for agents',
      mimeType: 'text/markdown',
    },
    async (uri) => {
      const text = await fetchText(`${SITE_URL}/docs/ai/components.md`);
      return {
        contents: [{ uri: uri.href, mimeType: 'text/markdown', text }],
      };
    }
  );

  server.registerResource(
    'docs-cursor-rules',
    'ply-ui://docs/cursor-rules',
    {
      title: 'Cursor / Windsurf project rules',
      description:
        'Save as .cursor/rules/ply-ui.mdc (or .windsurf/rules/ply-ui.md). Teaches assistants to write standalone zoneless Angular 22 with Ply without running MCP.',
      mimeType: 'text/markdown',
    },
    async (uri) => {
      const text = await fetchText(`${SITE_URL}/docs/ai/ply-ui.mdc`);
      return {
        contents: [{ uri: uri.href, mimeType: 'text/markdown', text }],
      };
    }
  );

  server.registerResource(
    'docs-snippets',
    'ply-ui://docs/snippets',
    {
      title: 'VS Code / Cursor snippets',
      description:
        'Save as .vscode/ply-ui.code-snippets. Prefixes like ply-card expand usage markup after CLI install.',
      mimeType: 'application/json',
    },
    async (uri) => {
      const text = await fetchText(`${SITE_URL}/docs/ai/ply-ui.code-snippets`);
      return {
        contents: [{ uri: uri.href, mimeType: 'application/json', text }],
      };
    }
  );

  server.registerResource(
    'component',
    new ResourceTemplate('ply-ui://component/{name}', {
      list: undefined,
    }),
    {
      title: 'Component metadata',
      description:
        'Registry metadata for one component. Free source files are listed without content; Pro never streams source via MCP in V1.',
      mimeType: 'application/json',
    },
    async (uri, vars) => {
      const name = String(vars.name || '');
      if (!isSafeItemName(name)) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify({ error: `Invalid name: ${name}` }),
            },
          ],
        };
      }
      const index = await fetchIndex();
      const entry = index.find((i) => i.name === name);
      if (!entry) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify({ error: `Unknown component: ${name}` }),
            },
          ],
        };
      }

      if (entry.tier === 'pro') {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify(
                {
                  ...entry,
                  files: null,
                  note: `Pro — metadata only. ${SITE_URL}/pricing`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      const item = await fetchFreeItem(name);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                name: item.name,
                tier: item.tier,
                category: item.category,
                description: item.description,
                usage: item.usage,
                keywords: item.keywords,
                dependencies: item.dependencies,
                registryDependencies: item.registryDependencies,
                files: item.files.map((f) => ({
                  path: f.name,
                  bytes: utf8ByteLength(f.content),
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
