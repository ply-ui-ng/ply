import { CLI_NPX } from './brand';

/** Copy-paste installer. Hosted catalog MCP cannot write files. */
export function cliAddCommand(name?: string): string {
  return name?.trim()
    ? `${CLI_NPX} add ${name.trim()}`
    : `${CLI_NPX} add <name>`;
}

export function installHint(name?: string): string {
  return (
    `This catalog does not write files. Install in the project with \`${cliAddCommand(name)}\`. ` +
    'Local stdio MCP (Cursor, Claude Code) can call add_components instead.'
  );
}
