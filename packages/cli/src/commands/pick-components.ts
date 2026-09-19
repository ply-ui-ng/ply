import { prompts } from '../vendor';
import type { RegistryIndexEntry } from '../registry';
import { CATEGORY_ORDER, CATEGORY_TITLES, categoryTitle } from '../categories';

import { CLI_NPX } from '../brand';

export const ADD_NEEDS_NAME =
  `Pass a component name: ${CLI_NPX} add <name>\n  Or run without --yes in a terminal to pick from the catalog.`;

export function canPromptInteractively(
  options: { yes?: boolean },
  tty: boolean = Boolean(process.stdin.isTTY && process.stdout.isTTY),
): boolean {
  return !options.yes && tty;
}

export function filterCatalog(index: RegistryIndexEntry[], filter: string): RegistryIndexEntry[] {
  if (filter === 'all') return index;
  if (filter === 'free' || filter === 'pro') {
    return index.filter((item) => item.tier === filter);
  }
  if (filter.startsWith('category:')) {
    const category = filter.slice('category:'.length);
    return index.filter((item) => (item.category || 'component') === category);
  }
  return index;
}

export function catalogFilterChoices(
  index: RegistryIndexEntry[],
): { title: string; value: string }[] {
  const count = (pred: (item: RegistryIndexEntry) => boolean) => index.filter(pred).length;
  const choices = [
    { title: `All (${index.length})`, value: 'all' },
    { title: `Free (${count((item) => item.tier === 'free')})`, value: 'free' },
    { title: `Pro (${count((item) => item.tier === 'pro')})`, value: 'pro' },
  ];
  for (const category of CATEGORY_ORDER) {
    const n = count((item) => (item.category || 'component') === category);
    if (!n) continue;
    choices.push({
      title: `${CATEGORY_TITLES[category]} (${n})`,
      value: `category:${category}`,
    });
  }
  return choices;
}

/** Title is what the prompts picker filters on (name, tier, category, keywords). */
export function pickerTitle(item: RegistryIndexEntry): string {
  const keywords = (item.keywords || []).slice(0, 6).join(' ');
  const label = `${item.name}  (${item.tier} · ${categoryTitle(item.category)})`;
  return keywords ? `${label}  ${keywords}` : label;
}

export function toPickerChoices(
  index: RegistryIndexEntry[],
): { title: string; value: string }[] {
  return [...index]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((item) => ({
      title: pickerTitle(item),
      value: item.name,
    }));
}

export async function pickComponents(index: RegistryIndexEntry[]): Promise<string[]> {
  const filterRes = await prompts({
    type: 'select',
    name: 'filter',
    message: 'Filter the catalog',
    choices: catalogFilterChoices(index),
  });
  if (!filterRes.filter) return [];

  const filtered = filterCatalog(index, String(filterRes.filter));
  if (!filtered.length) {
    console.error('No components in that filter.');
    return [];
  }

  const picked = await prompts({
    type: 'autocompleteMultiselect',
    name: 'components',
    message: 'Select components to add',
    hint: '- Type to filter. Space to select. Enter to confirm',
    instructions: false,
    min: 1,
    choices: toPickerChoices(filtered),
  });

  const selected = picked.components;
  if (!Array.isArray(selected) || selected.length === 0) return [];
  return selected.map(String);
}
