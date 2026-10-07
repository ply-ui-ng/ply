import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

const mcpVersion = (
  JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'package.json'), 'utf8')) as {
    version: string;
  }
).version;

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'es2022',
  clean: true,
  sourcemap: true,
  define: {
    __MCP_VERSION__: JSON.stringify(mcpVersion),
  },
});
