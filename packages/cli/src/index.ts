#!/usr/bin/env node

import { CLI_BIN } from './brand';

declare const __CLI_VERSION__: string;

function printHelp(): void {
  console.log(`Usage: ${CLI_BIN} <command> [options]

Commands:
  init                 Initialize your project (ply-ui.json, styles, icons, Cursor rules, snippets)
  add [components...]  Add components; omit names to pick from the catalog
  list                 List all available components (free and pro)
  diff [components...] Show upstream changes for installed components since you added them
  update [components...]  Pull in upstream changes, preserving local edits
  changelog <name>     Print product changelog entries for one component (or cli / mcp)
  doctor               Check that your project is set up correctly for Ply

Options:
  -y, --yes            Skip prompts
  -o, --overwrite      Overwrite components that already exist (add)
  -f, --force          On conflict, take the upstream version (update)
      --overwrite-local  On update, also revert files you edited that upstream did not change
      --merge            On conflict, 3-way merge using the installed snapshot as ancestor
  -V, --version        Print version
  -h, --help           Show help

https://ply-ui.com
Issues: https://github.com/ply-ui-ng/ply/issues
`);
}

interface Flags {
  yes: boolean;
  overwrite: boolean;
  force: boolean;
  overwriteLocal: boolean;
  merge: boolean;
  help: boolean;
  version: boolean;
}

function parseArgs(argv: string[]): { command: string | undefined; positionals: string[]; flags: Flags } {
  const flags: Flags = {
    yes: false,
    overwrite: false,
    force: false,
    overwriteLocal: false,
    merge: false,
    help: false,
    version: false,
  };
  const positionals: string[] = [];

  for (const arg of argv) {
    switch (arg) {
      case '-y':
      case '--yes':
        flags.yes = true;
        break;
      case '-o':
      case '--overwrite':
        flags.overwrite = true;
        break;
      case '-f':
      case '--force':
        flags.force = true;
        break;
      case '--overwrite-local':
        flags.overwriteLocal = true;
        break;
      case '--merge':
        flags.merge = true;
        break;
      case '-h':
      case '--help':
        flags.help = true;
        break;
      case '-V':
      case '--version':
        flags.version = true;
        break;
      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`);
          printHelp();
          process.exit(1);
        }
        positionals.push(arg);
    }
  }

  return { command: positionals[0], positionals: positionals.slice(1), flags };
}

async function main(): Promise<void> {
  const { command, positionals, flags } = parseArgs(process.argv.slice(2));

  if (flags.version && !command) {
    console.log(__CLI_VERSION__);
    return;
  }
  if (flags.help || !command) {
    printHelp();
    return;
  }

  switch (command) {
    case 'init': {
      const { init } = await import('./commands/init.js');
      await init({ yes: flags.yes });
      return;
    }
    case 'add': {
      const { add } = await import('./commands/add.js');
      await add(positionals, { yes: flags.yes, overwrite: flags.overwrite });
      return;
    }
    case 'list': {
      const { list } = await import('./commands/list.js');
      await list();
      return;
    }
    case 'diff': {
      const { diff } = await import('./commands/diff.js');
      await diff(positionals);
      return;
    }
    case 'update': {
      const { update } = await import('./commands/update.js');
      await update(positionals, {
        yes: flags.yes,
        force: flags.force,
        overwriteLocal: flags.overwriteLocal,
        merge: flags.merge,
      });
      return;
    }
    case 'changelog': {
      const { changelog } = await import('./commands/changelog.js');
      await changelog(positionals);
      return;
    }
    case 'doctor': {
      const { doctor } = await import('./commands/doctor.js');
      await doctor();
      return;
    }
    case '--version':
    case '-V':
      console.log(__CLI_VERSION__);
      return;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exitCode = 1;
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
