import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

const cliVersion = (
  JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'package.json'), 'utf8')) as {
    version: string;
  }
).version;

/**
 * Two output groups on purpose:
 *
 * - `dist/index.js` is the published bin. It must not contain `fetch` —
 *   Socket attributes [networkAccess](https://socket.dev/alerts/networkAccess)
 *   to the package entry when tsup inlines the registry client into this file.
 * - `dist/registry.js` (and `init`'s icon download) own the outbound GETs.
 *
 * Vendor libraries stay bundled (`noExternal`) so the tarball has no runtime
 * npm dependency tree.
 */
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    vendor: 'src/vendor.ts',
    registry: 'src/registry.ts',
    sync: 'src/sync.ts',
    'commands/init': 'src/commands/init.ts',
    'commands/add': 'src/commands/add.ts',
    'commands/list': 'src/commands/list.ts',
    'commands/diff': 'src/commands/diff.ts',
    'commands/update': 'src/commands/update.ts',
    'commands/changelog': 'src/commands/changelog.ts',
    'commands/doctor': 'src/commands/doctor.ts',
  },
  format: ['cjs'],
  target: 'es2020',
  platform: 'node',
  clean: true,
  minify: false,
  sourcemap: false,
  define: {
    __CLI_VERSION__: JSON.stringify(cliVersion),
  },
  noExternal: ['diff', 'ora', 'prompts', 'zod'],
  // Keep HTTP out of the published bin. Command modules are built as their
  // own files (see `entry`) and loaded at runtime.
  external: [
    './commands/init',
    './commands/init.js',
    './commands/add',
    './commands/add.js',
    './commands/list',
    './commands/list.js',
    './commands/diff',
    './commands/diff.js',
    './commands/update',
    './commands/update.js',
    './commands/changelog',
    './commands/changelog.js',
    './commands/doctor',
    './commands/doctor.js',
    './vendor',
    './vendor.js',
    '../vendor',
    '../vendor.js',
    './registry',
    './registry.js',
    '../registry',
    '../registry.js',
    './sync',
    './sync.js',
    '../sync',
    '../sync.js',
  ],
});
