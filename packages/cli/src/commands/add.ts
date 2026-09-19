import fs from 'fs';
import path from 'path';
import { ora, prompts } from '../vendor';
import {
  RegistryIndexEntry,
  RegistryItem,
  SITE_URL,
  fetchIndex,
  fetchItem,
  getLicenseKey,
  isSafeItemName,
  suggestNames,
} from '../registry';
import { readLockFile, recordComponent, writeLockFile } from '../lockfile';
import { readConfig } from '../config';
import { isSafeFileName } from '../path-safety';
import { isSafeNpmDependency } from '../integrity';
import { ADD_NEEDS_NAME, canPromptInteractively, pickComponents } from './pick-components';
import { canonicalComponentName } from '../aliases';
import { writeSnapshot } from '../snapshot';
import { CLI_NPX } from '../brand';

export interface AddOptions {
  yes?: boolean;
  overwrite?: boolean;
}

function detectPackageManager(cwd: string): 'pnpm' | 'yarn' | 'bun' | 'npm' {
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(cwd, 'bun.lockb')) || fs.existsSync(path.join(cwd, 'bun.lock'))) return 'bun';
  return 'npm';
}

function installedNpmDeps(cwd: string): Set<string> {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
    return new Set([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ]);
  } catch {
    return new Set();
  }
}

export async function add(components: string[], options: AddOptions = {}) {
  let names = (components || []).map((name) => name.trim()).filter(Boolean);
  names = names.map((name) => {
    const canonical = canonicalComponentName(name);
    if (canonical !== name) {
      console.log(`ℹ ${name} → ${canonical}`);
    }
    return canonical;
  });
  names = [...new Set(names)];

  if (names.length === 0 && !canPromptInteractively(options)) {
    console.error(ADD_NEEDS_NAME);
    process.exitCode = 1;
    return;
  }

  const config = readConfig();
  if (!config) {
    process.exitCode = 1;
    return;
  }

  const componentsRoot = path.resolve(process.cwd(), config.aliases.components);

  const indexSpinner = ora('Loading registry index...').start();
  let index: RegistryIndexEntry[];
  try {
    index = await fetchIndex();
    indexSpinner.succeed('Registry index loaded.');
  } catch (err: any) {
    indexSpinner.fail(err.message);
    process.exitCode = 1;
    return;
  }

  if (names.length === 0) {
    names = await pickComponents(index);
    if (names.length === 0) {
      console.log('Nothing to install.');
      return;
    }
  }

  const byName = new Map(index.map((i) => [i.name, i]));

  // Validate requested names up front, with suggestions for typos.
  let hadError = false;
  for (const name of names) {
    if (!isSafeItemName(name) || !byName.has(name)) {
      hadError = true;
      const suggestions = suggestNames(name, index.map((i) => i.name));
      console.error(`✖ Unknown component: '${name}'.`);
      if (suggestions.length) {
        console.error(`  Did you mean: ${suggestions.join(', ')}?`);
      }
      console.error(`  Run "${CLI_NPX} list" to see every available component.`);
    }
  }
  if (hadError) {
    process.exitCode = 1;
    return;
  }

  // Resolve the full dependency closure (breadth-first over registryDependencies).
  const requested = new Set(names);
  const toInstall = new Map<string, RegistryIndexEntry>();
  const queue = [...names];
  while (queue.length) {
    const name = queue.shift()!;
    if (toInstall.has(name)) continue;
    const entry = byName.get(name);
    if (!entry) {
      console.error(`✖ Registry index is missing dependency '${name}'. Aborting.`);
      process.exitCode = 1;
      return;
    }
    // Dependencies that already exist in the project are considered satisfied
    // unless the user explicitly asked for them again.
    const targetDir = path.join(componentsRoot, name);
    if (!requested.has(name) && fs.existsSync(targetDir)) continue;
    toInstall.set(name, entry);
    queue.push(...entry.registryDependencies);
  }

  // Pro gate — checked up front so users see the full picture before anything
  // is written. Actual enforcement happens server-side at the pro registry.
  const proItems = [...toInstall.values()].filter((i) => i.tier === 'pro');
  if (proItems.length && !getLicenseKey()) {
    console.error(`✖ The following components require a Ply Pro license: ${proItems.map((i) => i.name).join(', ')}`);
    console.error(`  Set the PLY_LICENSE_KEY environment variable to your license key.`);
    console.error(`  (BASE_UI_LICENSE_KEY is still accepted.)`);
    console.error(`  Get a license at ${SITE_URL}/pricing.`);
    process.exitCode = 1;
    return;
  }

  // Confirm overwrites of explicitly requested components that already exist.
  for (const name of requested) {
    const targetDir = path.join(componentsRoot, name);
    if (!fs.existsSync(targetDir)) continue;
    if (options.overwrite || options.yes) continue;
    const res = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `${path.relative(process.cwd(), targetDir)} already exists. Overwrite it?`,
      initial: false,
    });
    if (!res.overwrite) {
      toInstall.delete(name);
      console.log(`  Skipped ${name}.`);
    }
  }

  if (toInstall.size === 0) {
    console.log('Nothing to install.');
    return;
  }

  const npmDeps = new Set<string>();
  const installedItems: string[] = [];
  const lock = readLockFile();

  for (const [name, entry] of toInstall) {
    const spinner = ora(`Fetching ${name}...`).start();
    let item: RegistryItem;
    try {
      item = await fetchItem(name, entry.tier, entry.digest);
    } catch (err: any) {
      spinner.fail(`Failed to fetch ${name}: ${err.code === 'NOT_FOUND' ? 'not found in registry.' : err.message}`);
      process.exitCode = 1;
      return;
    }

    // Validate the whole payload before touching the filesystem, so a bad
    // entry anywhere cannot leave a half-written component behind.
    const unsafeFile = item.files.find((f) => !isSafeFileName(f.name));
    if (unsafeFile) {
      spinner.fail(`Registry payload for ${name} contains an unsafe file path ('${unsafeFile.name}') — nothing was written.`);
      process.exitCode = 1;
      return;
    }
    const unsafeDep = item.dependencies.find((d) => !isSafeNpmDependency(d));
    if (unsafeDep) {
      spinner.fail(`Registry payload for ${name} lists an invalid npm dependency ('${unsafeDep}') — nothing was written.`);
      process.exitCode = 1;
      return;
    }

    const targetDir = path.join(componentsRoot, name);
    try {
      for (const file of item.files) {
        const filePath = path.join(targetDir, file.name);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, file.content, 'utf8');
        writeSnapshot(name, file.name, file.content);
      }
    } catch (err: any) {
      spinner.fail(`Failed to write ${name}: ${err.message}`);
      process.exitCode = 1;
      return;
    }

    item.dependencies.forEach((d) => npmDeps.add(d));
    installedItems.push(name);
    recordComponent(lock, name, entry.tier, item.files);
    spinner.succeed(`${name} → ${path.relative(process.cwd(), targetDir)}${entry.tier === 'pro' ? '  (pro)' : ''}`);
  }

  if (installedItems.length) {
    writeLockFile(lock);
  }

  // Print the install command instead of spawning npm/pnpm/yarn/bun.
  // child_process is flagged as "shell access" by supply-chain scanners even
  // when `shell` is false; the CLI never executes a package manager.
  const existing = installedNpmDeps(process.cwd());
  const missingDeps = [...npmDeps].filter((d) => !existing.has(d));
  if (missingDeps.length) {
    const pm = detectPackageManager(process.cwd());
    const cmd =
      pm === 'npm'
        ? `npm install ${missingDeps.join(' ')}`
        : `${pm} add ${missingDeps.join(' ')}`;
    console.log(
      `\nInstall missing npm ${missingDeps.length === 1 ? 'dependency' : 'dependencies'}:\n  ${cmd}`
    );
  }

  console.log(`\n✔ Added ${installedItems.length} ${installedItems.length === 1 ? 'component' : 'components'}: ${installedItems.join(', ')}`);
}
