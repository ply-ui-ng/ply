import path from 'path';
import { ora } from '../vendor';
import { readConfig } from '../config';
import { readLockFile } from '../lockfile';
import { fetchIndex } from '../registry';
import { computeComponentDiff, hasChanges, hasConflicts, renderDiff, statusLabel } from '../sync';
import { CLI_NPX } from '../brand';

export async function diff(components: string[]) {
  const config = readConfig();
  if (!config) {
    process.exitCode = 1;
    return;
  }
  const componentsRoot = path.resolve(process.cwd(), config.aliases.components);

  const lock = readLockFile();
  const tracked = Object.keys(lock.components).sort();
  if (!tracked.length) {
    console.log('No components are tracked yet. Components installed with "add" (after this version of the CLI) are tracked automatically.');
    return;
  }

  const targets = components.length ? components : tracked;
  const unknown = targets.filter((n) => !tracked.includes(n));
  if (unknown.length) {
    console.error(`✖ Not tracked: ${unknown.join(', ')}`);
    console.error(`  Tracked components: ${tracked.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const spinner = ora(`Checking ${targets.length} component${targets.length === 1 ? '' : 's'} against upstream...`).start();
  let index;
  try {
    index = await fetchIndex();
  } catch (err: any) {
    spinner.fail(err.message);
    process.exitCode = 1;
    return;
  }
  const results = [];
  for (const name of targets) {
    results.push(await computeComponentDiff(name, componentsRoot, lock, index));
  }
  spinner.stop();

  let anyChanges = false;
  let anyConflicts = false;
  const upToDate: string[] = [];
  const errored: string[] = [];

  for (const result of results) {
    if (result.error) {
      errored.push(result.name);
      console.log(`\n✖ ${result.name}: ${result.error}`);
      continue;
    }
    if (!hasChanges(result)) {
      upToDate.push(result.name);
      continue;
    }
    anyChanges = true;
    if (hasConflicts(result)) anyConflicts = true;
    console.log(`\n${result.name}${result.tier === 'pro' ? '  (pro)' : ''}`);
    for (const file of result.files) {
      if (file.status === 'unchanged') continue;
      console.log(`  ${file.path}  —  ${statusLabel(file.status)}`);
      if (file.status === 'upstream-changed' || file.status === 'conflict' || file.status === 'new-upstream') {
        console.log(renderDiff(file.localContent, file.upstreamContent)
          .split('\n')
          .map((l) => `    ${l}`)
          .join('\n'));
      }
    }
  }

  if (upToDate.length) {
    console.log(`\n✔ Up to date: ${upToDate.join(', ')}`);
  }
  if (anyChanges) {
    console.log(`\nRun "${CLI_NPX} update${components.length ? ' ' + components.join(' ') : ''}" to apply upstream changes.`);
    if (anyConflicts) {
      console.log('Some files were edited both locally and upstream — update will ask how to resolve each one.');
    }
  }
  if (errored.length) {
    process.exitCode = 1;
  }
}
