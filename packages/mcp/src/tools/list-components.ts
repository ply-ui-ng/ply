import { z } from 'zod';
import { fetchIndex, itemHaystack, itemLicense, type Category } from '../registry';
import { installHint } from '../install-hint';
import { failJson, okJson } from '../result';

const CATEGORIES = [
  'application',
  'page-layout',
  'block',
  'widget',
  'shell',
  'component',
] as const satisfies readonly Category[];

export const listComponentsInput = {
  tier: z
    .enum(['free', 'pro', 'all'])
    .optional()
    .default('all')
    .describe('Filter by license tier'),
  category: z
    .enum(CATEGORIES)
    .optional()
    .describe('Filter by registry category'),
  q: z
    .string()
    .optional()
    .describe('Substring filter on name, description, usage, or keywords (case-insensitive)'),
};

export async function listComponents(args: {
  tier?: 'free' | 'pro' | 'all';
  category?: Category;
  q?: string;
}) {
  try {
    const index = await fetchIndex();
    const tier = args.tier ?? 'all';
    const q = args.q?.trim().toLowerCase();

    let items = index;
    if (tier !== 'all') {
      items = items.filter((i) => i.tier === tier);
    }
    if (args.category) {
      items = items.filter((i) => (i.category || 'component') === args.category);
    }
    if (q) {
      items = items.filter((i) => itemHaystack(i).includes(q));
    }

    items = [...items].sort((a, b) => a.name.localeCompare(b.name));

    return okJson({
      ok: true,
      count: items.length,
      items: items.map((i) => ({
        name: i.name,
        tier: i.tier,
        license: i.license || itemLicense(i.tier),
        category: i.category || 'component',
        description: i.description || '',
        usage: i.usage || '',
        keywords: i.keywords || [],
        dependencies: i.dependencies,
        registryDependencies: i.registryDependencies,
      })),
      hint: `Use get_component for details. ${installHint()}`,
    });
  } catch (err: any) {
    return failJson(err.message || String(err));
  }
}
