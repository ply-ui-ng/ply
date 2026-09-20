/**
 * Thin registry client — mirrors packages/cli/src/registry.ts URLs/schemas
 * so the MCP server can return structured JSON without parsing CLI stdout.
 * Install/write side effects still go through ply-ui-cli (canonical path).
 */
import { z } from 'zod';

export const SITE_URL = 'https://ply-ui.com';
export const GITHUB_HUB_URL = 'https://github.com/ply-ui-ng/ply';

const env =
  typeof process !== 'undefined' && process.env ? process.env : ({} as Record<string, string | undefined>);

function firstEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const v = env[name]?.trim();
    if (v) return v;
  }
}

export const FREE_REGISTRY_URL =
  firstEnv('PLY_REGISTRY_URL', 'BASE_UI_REGISTRY_URL') || `${SITE_URL}/registry`;

export const PRO_REGISTRY_URL =
  firstEnv('PLY_PRO_REGISTRY_URL', 'BASE_UI_PRO_REGISTRY_URL') ||
  'https://pro.ply-ui.com/registry';

const registryFileSchema = z.object({
  name: z.string(),
  content: z.string(),
});

export const registryItemSchema = z.object({
  name: z.string(),
  tier: z.enum(['free', 'pro']),
  category: z
    .enum(['application', 'page-layout', 'block', 'widget', 'shell', 'component'])
    .optional()
    .default('component'),
  dependencies: z.array(z.string()).default([]),
  registryDependencies: z.array(z.string()).default([]),
  description: z.string().optional().default(''),
  usage: z.string().optional().default(''),
  keywords: z.array(z.string()).optional().default([]),
  files: z.array(registryFileSchema),
  type: z.string().optional(),
  license: z.enum(['MIT', 'Ply Pro']).optional(),
});

export const registryIndexSchema = z.array(registryItemSchema.omit({ files: true }));

export type RegistryItem = z.infer<typeof registryItemSchema>;
export type RegistryIndexEntry = z.infer<typeof registryIndexSchema>[number];

export type Category = NonNullable<RegistryIndexEntry['category']>;

export function itemLicense(tier: 'free' | 'pro'): 'MIT' | 'Ply Pro' {
  return tier === 'pro' ? 'Ply Pro' : 'MIT';
}

export function hubSourceUrl(name: string): string {
  return `${GITHUB_HUB_URL}/tree/main/components/${name}`;
}

export function itemHaystack(
  item: Pick<RegistryIndexEntry, 'name' | 'description' | 'usage' | 'keywords'>
): string {
  return [item.name, item.description, item.usage, ...(item.keywords ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function isSafeItemName(name: string): boolean {
  return /^[a-z0-9][a-z0-9-.]*$/i.test(name) && !name.includes('..');
}

async function fetchJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(url, { headers });
  } catch (err: any) {
    throw new Error(
      `Network error while contacting the registry (${err.message}). Check your connection and try again.`
    );
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error(
      `License rejected (HTTP ${res.status}). Check PLY_LICENSE_KEY, or see ${SITE_URL}/pricing.`
    );
  }
  if (res.status === 404) {
    const e: any = new Error('Not found');
    e.code = 'NOT_FOUND';
    throw e;
  }
  if (!res.ok) {
    throw new Error(`Registry request failed (HTTP ${res.status}) for ${url}.`);
  }
  return res.json();
}

export async function fetchIndex(): Promise<RegistryIndexEntry[]> {
  const data = await fetchJson(`${FREE_REGISTRY_URL}/index.json`);
  return registryIndexSchema.parse(data);
}

/** Free registry item only — V1 never streams Pro source through MCP. */
export async function fetchFreeItem(name: string): Promise<RegistryItem> {
  if (!isSafeItemName(name)) {
    throw new Error(`Invalid component name: '${name}'.`);
  }
  const data = await fetchJson(`${FREE_REGISTRY_URL}/styles/default/${name}.json`);
  return registryItemSchema.parse(data);
}

export async function fetchText(url: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err: any) {
    throw new Error(`Network error fetching ${url}: ${err.message}`);
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} (HTTP ${res.status}).`);
  }
  return res.text();
}

/** Closest names to `query`, for search / suggestions. */
export function suggestNames(query: string, names: string[], limit = 8): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const scored = names
    .map((name) => {
      const n = name.toLowerCase();
      let score: number;
      if (n === q) score = 0;
      else if (n.startsWith(q) || q.startsWith(n)) score = 1;
      else if (n.includes(q) || q.includes(n)) score = 2;
      else score = 3 + levenshtein(q, n);
      return { name, score };
    })
    .filter((s) => s.score <= 6)
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
  return scored.slice(0, limit).map((s) => s.name);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = curr;
  }
  return prev[n];
}
