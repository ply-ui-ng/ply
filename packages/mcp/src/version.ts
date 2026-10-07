import packageJson from '../package.json' with { type: 'json' };

/** Bundled from packages/mcp/package.json by tsup and by the Workers deploy. */
export const PACKAGE_VERSION: string = packageJson.version;
