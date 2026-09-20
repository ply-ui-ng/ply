import { z } from 'zod';
import { canonicalComponentName } from '../aliases';
import { fetchIndex, itemHaystack, suggestNames, itemLicense, type Category } from '../registry';
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

export const searchComponentsInput = {
  query: z
    .string()
    .min(1)
    .describe('Natural-language or substring query (e.g. "dialog modal", "button"). Matches name, description, usage, and keywords.'),
  tier: z
    .enum(['free', 'pro', 'all'])
    .optional()
    .default('all')
    .describe('Filter by license tier'),
  category: z.enum(CATEGORIES).optional().describe('Filter by registry category'),
  limit: z.number().int().min(1).max(40).optional().default(12),
};

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

export async function searchComponents(args: {
  query: string;
  tier?: 'free' | 'pro' | 'all';
  category?: Category;
  limit?: number;
}) {
  try {
    const index = await fetchIndex();
    const tier = args.tier ?? 'all';
    const limit = args.limit ?? 12;
    const rawQuery = args.query.trim();
    const canonical = canonicalComponentName(rawQuery);
    const variants = [...new Set([rawQuery, canonical].filter(Boolean))];

    let pool = index;
    if (tier !== 'all') {
      pool = pool.filter((i) => i.tier === tier);
    }
    if (args.category) {
      pool = pool.filter((i) => (i.category || 'component') === args.category);
    }

    const names = pool.map((i) => i.name);
    const byFuzzy = new Set(variants.flatMap((q) => suggestNames(q, names, limit)));

    const byTokens = pool.filter((i) => {
      const hay = itemHaystack(i);
      return variants.some((q) => {
        const tokens = tokenize(q);
        return tokens.length > 0 && tokens.every((t) => hay.includes(t));
      });
    });

    const ranked = [
      ...byTokens.sort((a, b) => a.name.localeCompare(b.name)),
      ...pool
        .filter((i) => byFuzzy.has(i.name) && !byTokens.some((t) => t.name === i.name))
        .sort(
          (a, b) =>
            [...byFuzzy].indexOf(a.name) - [...byFuzzy].indexOf(b.name)
        ),
    ].slice(0, limit);

    return okJson({
      ok: true,
      query: args.query,
      count: ranked.length,
      matches: ranked.map((i) => ({
        name: i.name,
        tier: i.tier,
        license: i.license || itemLicense(i.tier),
        category: i.category || 'component',
        description: i.description || '',
        usage: i.usage || '',
        keywords: i.keywords || [],
        registryDependencies: i.registryDependencies,
      })),
      hint: `Next: get_component for details. ${installHint()}`,
    });
  } catch (err: any) {
    return failJson(err.message || String(err));
  }
}
