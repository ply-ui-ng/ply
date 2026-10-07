import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

const mcpVersion = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version as string;

export default defineConfig({
  define: {
    __MCP_VERSION__: JSON.stringify(mcpVersion),
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
