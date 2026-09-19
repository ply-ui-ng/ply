import fs from 'fs';
import path from 'path';
import { ora, prompts } from '../vendor';
import { readConfig } from '../config';
import { readLockFile, writeLockFile, hashContent } from '../lockfile';
import { isSafeFileName } from '../path-safety';
import { fetchIndex } from '../registry';
import { computeComponentDiff, hasChanges, renderDiff, ComponentDiff, FileDiff } from '../sync';
import { writeSnapshot } from '../snapshot';
import { mergeThreeWay } from '../merge';

export interface UpdateOptions {
  yes?: boolean;
  force?: boolean;
  /** Revert files that were edited locally while upstream stayed the same. */
  overwriteLocal?: boolean;
  /** On conflict, apply a 3-way merge using the installed snapshot as ancestor. */
  merge?: boolean;
}

type ConflictChoice = 'keep' | 'upstream' | 'save-aside' | 'merge';

async function resolveConflict(name: string, file: FileDiff): Promise<ConflictChoice> {
  while (true) {
    const res = await prompts({
      type: 'select',
      name: 'choice',
      message: `${name}/${file.path} was edited both locally and upstream. What do you want to do?`,
      choices: [
        { title: 'Merge (3-way, installed snapshot as ancestor)', value: 'merge' },
        { title: 'Keep my version (skip)', value: 'keep' },
        { title: 'Take the upstream version (overwrite my edits)', value: 'upstream' },
        { title: `Save upstream as ${file.path}.upstream (merge by hand, keep my file as-is)`, value: 'save-aside' },
        { title: 'View diff', value: 'view' },
      ],
    });
    if (!res.choice || res.choice === 'keep') return 'keep';
    if (res.choice === 'view') {
      console.log(renderDiff(file.localContent, file.upstreamContent));
      continue;
    }
    return res.choice as ConflictChoice;
  }
}

export async function update(components: string[], options: UpdateOptions = {}) {
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
  const diffs: ComponentDiff[] = [];
  for (const name of targets) {
    diffs.push(await computeComponentDiff(name, componentsRoot, lock, index));
  }
  spinner.stop();

  let updated = 0;
  let added = 0;
  let keptLocal = 0;
  let overwrittenLocal = 0;
  let conflictsToUpstream = 0;
  let conflictsSavedAside = 0;
  let conflictsSkipped = 0;
  let conflictsMerged = 0;
  let conflictsMergeDirty = 0;
  const errored: string[] = [];
  let lockChanged = false;

  for (const result of diffs) {
    if (result.error) {
      errored.push(result.name);
      console.log(`✖ ${result.name}: ${result.error}`);
      continue;
    }
    if (!hasChanges(result)) continue;

    for (const file of result.files) {
      const localPath = path.join(componentsRoot, result.name, file.path);

      if (file.status === 'unchanged') {
        // Untracked file whose local content already matched upstream the
        // first time we saw it (e.g. added upstream after install, but your
        // copy happened to already match). Nothing to write, but start
        // tracking it now so future runs don't recompute this from scratch.
        if (file.localContent !== undefined && !(file.path in lock.components[result.name].files)) {
          lock.components[result.name].files[file.path] = hashContent(file.localContent);
          lockChanged = true;
        }
        continue;
      }

      if (file.status === 'locally-modified') {
        if (options.overwriteLocal) {
          if (!isSafeFileName(file.path)) {
            console.warn(`⚠ Skipping unsafe file path from registry: ${result.name}/${file.path}`);
            continue;
          }
          fs.mkdirSync(path.dirname(localPath), { recursive: true });
          fs.writeFileSync(localPath, file.upstreamContent ?? '', 'utf8');
          lock.components[result.name].files[file.path] = hashContent(file.upstreamContent ?? '');
          writeSnapshot(result.name, file.path, file.upstreamContent ?? '');
          lockChanged = true;
          overwrittenLocal++;
          console.log(`  ↓ ${result.name}/${file.path}  (reverted local edits; upstream unchanged)`);
        } else {
          keptLocal++;
        }
        continue;
      }

      if (file.status === 'removed-upstream' || file.status === 'missing-locally') {
        // Nothing safe to apply automatically; these are informational only.
        continue;
      }

      if (!isSafeFileName(file.path)) {
        console.warn(`⚠ Skipping unsafe file path from registry: ${result.name}/${file.path}`);
        continue;
      }

      if (file.status === 'upstream-changed' || file.status === 'new-upstream') {
        fs.mkdirSync(path.dirname(localPath), { recursive: true });
        fs.writeFileSync(localPath, file.upstreamContent ?? '', 'utf8');
        lock.components[result.name].files[file.path] = hashContent(file.upstreamContent ?? '');
        writeSnapshot(result.name, file.path, file.upstreamContent ?? '');
        lockChanged = true;
        if (file.status === 'new-upstream') added++;
        else updated++;
        console.log(`  ${file.status === 'new-upstream' ? '+' : '↑'} ${result.name}/${file.path}`);
        continue;
      }

      if (file.status === 'conflict') {
        let choice: ConflictChoice;
        if (options.force) {
          choice = 'upstream';
        } else if (options.merge) {
          choice = 'merge';
        } else if (options.yes) {
          choice = 'keep';
        } else {
          choice = await resolveConflict(result.name, file);
        }

        if (choice === 'merge') {
          const ancestor = file.ancestorContent;
          if (ancestor === undefined) {
            conflictsSkipped++;
            console.log(
              `  = ${result.name}/${file.path}  (no install snapshot — cannot 3-way merge; re-add the component to start tracking ancestors)`
            );
          } else {
            const merged = mergeThreeWay({
              ancestor,
              local: file.localContent ?? '',
              upstream: file.upstreamContent ?? '',
            });
            fs.writeFileSync(localPath, merged.text, 'utf8');
            lock.components[result.name].files[file.path] = hashContent(merged.text);
            writeSnapshot(result.name, file.path, merged.text);
            lockChanged = true;
            if (merged.clean) {
              conflictsMerged++;
              console.log(`  ⋈ ${result.name}/${file.path}  (3-way merge, clean)`);
            } else {
              conflictsMergeDirty++;
              console.log(
                `  ⚠ ${result.name}/${file.path}  (3-way merge left conflict markers — edit the file)`
              );
            }
          }
        } else if (choice === 'upstream') {
          fs.writeFileSync(localPath, file.upstreamContent ?? '', 'utf8');
          lock.components[result.name].files[file.path] = hashContent(file.upstreamContent ?? '');
          writeSnapshot(result.name, file.path, file.upstreamContent ?? '');
          lockChanged = true;
          conflictsToUpstream++;
          console.log(`  ↑ ${result.name}/${file.path}  (took upstream, your edits were overwritten)`);
        } else if (choice === 'save-aside') {
          fs.writeFileSync(`${localPath}.upstream`, file.upstreamContent ?? '', 'utf8');
          conflictsSavedAside++;
          console.log(`  ⇄ ${result.name}/${file.path}.upstream  (merge by hand — your file was left untouched)`);
        } else {
          conflictsSkipped++;
          console.log(`  = ${result.name}/${file.path}  (kept your version)`);
        }
      }
    }
  }

  if (lockChanged) {
    writeLockFile(lock);
  }

  console.log('');
  if (updated) console.log(`✔ ${updated} file${updated === 1 ? '' : 's'} updated from upstream.`);
  if (added) console.log(`✔ ${added} new file${added === 1 ? '' : 's'} added.`);
  if (overwrittenLocal) {
    console.log(
      `✔ ${overwrittenLocal} local edit${overwrittenLocal === 1 ? '' : 's'} overwritten (--overwrite-local).`
    );
  }
  if (keptLocal) {
    console.log(
      `— ${keptLocal} local edit${keptLocal === 1 ? '' : 's'} kept (upstream unchanged). Re-run with --overwrite-local to discard them.`
    );
  }
  if (conflictsMerged) console.log(`⋈ ${conflictsMerged} conflict${conflictsMerged === 1 ? '' : 's'} resolved with a 3-way merge.`);
  if (conflictsMergeDirty) {
    console.log(
      `⚠ ${conflictsMergeDirty} conflict${conflictsMergeDirty === 1 ? '' : 's'} merged with leftover markers — edit those files.`
    );
    process.exitCode = 1;
  }
  if (conflictsToUpstream) console.log(`↑ ${conflictsToUpstream} conflict${conflictsToUpstream === 1 ? '' : 's'} resolved by taking upstream.`);
  if (conflictsSavedAside) console.log(`⇄ ${conflictsSavedAside} conflict${conflictsSavedAside === 1 ? '' : 's'} saved as .upstream for manual merge.`);
  if (conflictsSkipped) console.log(`= ${conflictsSkipped} conflict${conflictsSkipped === 1 ? '' : 's'} skipped (kept local). Re-run without --yes, or with --force, to resolve.`);
  if (!updated && !added && !overwrittenLocal && !conflictsToUpstream && !conflictsSavedAside && !conflictsSkipped && !conflictsMerged && !conflictsMergeDirty) {
    console.log('Everything is up to date.');
  }

  if (errored.length) {
    process.exitCode = 1;
  }
}
