import { z } from './vendor';
import { computeItemDigest, verifyIndexSignature } from './integrity';

export const SITE_URL = 'https://ply-ui.com';

function firstEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const v = process.env[name]?.trim();
    if (v) return v;
  }
}

function requireSignature(): boolean {
  return (
    process.env.PLY_REQUIRE_SIGNATURE === '1' ||
    process.env.BASE_UI_REQUIRE_SIGNATURE === '1'
  );
}

/** Public registry — free components, deployed with the site. */
export const FREE_REGISTRY_URL =
  firstEnv('PLY_REGISTRY_URL', 'BASE_UI_REGISTRY_URL') || `${SITE_URL}/registry`;

/** Authenticated registry — pro components, requires a valid license key. */
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
});

export const registryIndexSchema = z.array(
  registryItemSchema.omit({ files: true }).extend({
    /** sha256 of the item payload, published by the build. Optional so a CLI
     * newer than the deployed registry keeps working. */
    digest: z.string().optional(),
  })
);

export type RegistryItem = z.infer<typeof registryItemSchema>;
export type RegistryIndexEntry = z.infer<typeof registryIndexSchema>[number];

/** Search haystack for CLI suggestions / MCP query matching. */
export function itemHaystack(item: Pick<RegistryIndexEntry, 'name' | 'description' | 'keywords'>): string {
  return [item.name, item.description, ...(item.keywords ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** Item names come from user input and index data — keep them path-safe. */
export function isSafeItemName(name: string): boolean {
  return /^[a-z0-9][a-z0-9-.]*$/i.test(name) && !name.includes('..');
}

export function getLicenseKey(): string | undefined {
  return firstEnv('PLY_LICENSE_KEY', 'BASE_UI_LICENSE_KEY');
}

async function fetchText(url: string, headers: Record<string, string> = {}): Promise<string> {
  let res: Response;
  try {
    // Outbound GET to the Ply registry (or a PLY_* / BASE_UI_* registry URL mirror).
    res = await fetch(url, { headers });
  } catch (err: any) {
    throw new Error(`Network error while contacting the registry (${err.message}). Check your connection and try again.`);
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error(`Your license key was rejected (HTTP ${res.status}). Check PLY_LICENSE_KEY, or contact support via ${SITE_URL}.`);
  }
  if (res.status === 404) {
    const e: any = new Error('Not found');
    e.code = 'NOT_FOUND';
    throw e;
  }
  if (!res.ok) {
    throw new Error(`Registry request failed (HTTP ${res.status}) for ${url}.`);
  }
  return res.text();
}

async function fetchJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  return JSON.parse(await fetchText(url, headers));
}

/** Detached index signature, or undefined when the registry publishes none. */
async function fetchIndexSignature(): Promise<unknown> {
  try {
    return await fetchJson(`${FREE_REGISTRY_URL}/index.json.sig`);
  } catch {
    return undefined;
  }
}

export async function fetchIndex(): Promise<RegistryIndexEntry[]> {
  const raw = await fetchText(`${FREE_REGISTRY_URL}/index.json`);
  const verdict = verifyIndexSignature(raw, await fetchIndexSignature());

  if (verdict.status === 'invalid') {
    throw new Error(
      `Registry index integrity check failed: ${verdict.reason}.\n` +
        `Nothing was written. Report this at ${SITE_URL} — do not bypass this error.`
    );
  }
  if (verdict.status === 'unsigned' && requireSignature()) {
    throw new Error(
      `PLY_REQUIRE_SIGNATURE=1 but the registry index could not be verified: ${verdict.reason}.`
    );
  }

  return registryIndexSchema.parse(JSON.parse(raw));
}

/**
 * Fetch one item, verifying it against the digest published in the index.
 *
 * Pro items are served by a different origin than the index that vouches for
 * them, so a mismatch means one of the two was tampered with. The caller passes
 * the index entry's digest; when the deployed registry predates digests the
 * check is skipped rather than failing the install.
 */
export async function fetchItem(
  name: string,
  tier: 'free' | 'pro',
  expectedDigest?: string
): Promise<RegistryItem> {
  if (!isSafeItemName(name)) {
    throw new Error(`Invalid component name: '${name}'.`);
  }
  let data: unknown;
  if (tier === 'pro') {
    const key = getLicenseKey();
    if (!key) {
      throw new Error(
        `'${name}' is a Pro component. Set the PLY_LICENSE_KEY environment variable to your license key.\nGet a license at ${SITE_URL}/pricing.`
      );
    }
    data = await fetchJson(`${PRO_REGISTRY_URL}/styles/default/${name}.json`, {
      authorization: `Bearer ${key}`,
    });
  } else {
    data = await fetchJson(`${FREE_REGISTRY_URL}/styles/default/${name}.json`);
  }
  const item = registryItemSchema.parse(data);

  if (expectedDigest) {
    const actual = computeItemDigest(item);
    if (actual !== expectedDigest) {
      throw new Error(
        `Integrity check failed for '${name}': the downloaded files do not match the digest published in the registry index ` +
          `(expected ${expectedDigest.slice(0, 12)}…, got ${actual.slice(0, 12)}…). Nothing was written.`
      );
    }
  } else if (requireSignature()) {
    throw new Error(
      `PLY_REQUIRE_SIGNATURE=1 but the registry index publishes no digest for '${name}'.`
    );
  }

  return item;
}

/** Closest names to `query`, for "did you mean" suggestions. */
export function suggestNames(query: string, names: string[], limit = 5): string[] {
  const q = query.toLowerCase();
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
    .sort((a, b) => a.score - b.score);
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
