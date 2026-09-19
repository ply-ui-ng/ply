import { SITE_URL, fetchIndex, isSafeItemName, suggestNames } from '../registry';
import { CLI_NPX } from '../brand';

const CHANGELOG_URL =
  process.env.PLY_CHANGELOG_URL?.trim() ||
  process.env.BASE_UI_CHANGELOG_URL?.trim() ||
  `${SITE_URL}/assets/changelog.json`;

interface ChangelogEntry {
  hash: string;
  date: string;
  scope: string | null;
  breaking?: boolean;
  description: string;
  type?: string;
  components?: string[];
}

function flattenEntries(payload: { months?: unknown[] }): ChangelogEntry[] {
  const out: ChangelogEntry[] = [];
  for (const month of payload.months ?? []) {
    if (!month || typeof month !== 'object') continue;
    const block = month as {
      entries?: ChangelogEntry[];
      sections?: { entries?: ChangelogEntry[] }[];
    };
    const entries = block.entries?.length
      ? block.entries
      : (block.sections ?? []).flatMap((section) => section.entries ?? []);
    out.push(...entries);
  }
  return out;
}

function matchesName(entry: ChangelogEntry, name: string): boolean {
  if (entry.scope === name) return true;
  return Array.isArray(entry.components) && entry.components.includes(name);
}

export async function changelog(names: string[]): Promise<void> {
  const name = names[0]?.trim();
  if (!name || names.length !== 1) {
    console.error(`Usage: ${CLI_NPX} changelog <name>`);
    process.exitCode = 1;
    return;
  }
  if (!isSafeItemName(name)) {
    console.error(`✖ Invalid component name: '${name}'.`);
    process.exitCode = 1;
    return;
  }

  let payload: { months?: unknown[] };
  try {
    const res = await fetch(CHANGELOG_URL);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    payload = (await res.json()) as { months?: unknown[] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✖ Could not load changelog (${message}).`);
    console.error(`  ${SITE_URL}/changelog`);
    process.exitCode = 1;
    return;
  }

  const hits = flattenEntries(payload).filter((entry) => matchesName(entry, name));
  if (!hits.length) {
    try {
      const index = await fetchIndex();
      const known =
        index.some((item) => item.name === name) || name === 'cli' || name === 'mcp';
      if (!known) {
        const suggestions = suggestNames(
          name,
          index.map((item) => item.name)
        );
        console.error(`✖ Unknown component: '${name}'.`);
        if (suggestions.length) {
          console.error(`  Did you mean: ${suggestions.join(', ')}`);
        }
        process.exitCode = 1;
        return;
      }
    } catch {
      // Registry unreachable — still point at the public changelog.
    }
    console.log(`No changelog entries for '${name}' yet.`);
    console.log(`Full history: ${SITE_URL}/changelog`);
    return;
  }

  console.log(`${name} — ${hits.length} matching update${hits.length === 1 ? '' : 's'}\n`);
  for (const entry of hits) {
    const type = (entry.type || 'other').padEnd(8);
    const bang = entry.breaking ? ' BREAKING' : '';
    console.log(`${entry.date}  ${type}  ${entry.hash}${bang}  ${entry.description}`);
  }
  console.log(`\nFull history: ${SITE_URL}/changelog`);
}
