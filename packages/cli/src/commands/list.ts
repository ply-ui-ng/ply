import { ora } from '../vendor';
import { SITE_URL, fetchIndex, type RegistryIndexEntry } from '../registry';
import { CLI_NPX } from '../brand';
import { CATEGORY_ORDER, CATEGORY_TITLES } from '../categories';

export async function list() {
  const spinner = ora('Loading registry index...').start();
  let index: RegistryIndexEntry[];
  try {
    index = await fetchIndex();
    spinner.stop();
  } catch (err: any) {
    spinner.fail(err.message);
    process.exitCode = 1;
    return;
  }

  const printColumns = (names: string[]) => {
    if (names.length === 0) return;
    const width = Math.max(...names.map((n) => n.length)) + 2;
    const perRow = Math.max(1, Math.floor(80 / width));
    for (let i = 0; i < names.length; i += perRow) {
      console.log('  ' + names.slice(i, i + perRow).map((n) => n.padEnd(width)).join(''));
    }
  };

  const printTier = (tier: 'free' | 'pro', label: string, footnote: string) => {
    const items = index.filter((i) => i.tier === tier);
    console.log(`\n${label} (${items.length}) — ${footnote}\n`);

    for (const category of CATEGORY_ORDER) {
      const names = items
        .filter((i) => (i.category || 'component') === category)
        .map((i) => i.name)
        .sort();
      if (!names.length) continue;
      console.log(`  ${CATEGORY_TITLES[category] || category} (${names.length})`);
      printColumns(names);
      console.log('');
    }

    const known = new Set<string>(CATEGORY_ORDER);
    const other = items
      .filter((i) => i.category && !known.has(i.category))
      .map((i) => i.name)
      .sort();
    if (other.length) {
      console.log(`  Other (${other.length})`);
      printColumns(other);
      console.log('');
    }
  };

  printTier('free', 'Free components', `${CLI_NPX} add <name>`);
  printTier('pro', 'Pro components', `require a license (${SITE_URL}/pricing)`);
}
