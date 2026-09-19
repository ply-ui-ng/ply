import { z } from 'zod';
import {
  SITE_URL,
  fetchFreeItem,
  fetchIndex,
  isSafeItemName,
  suggestNames,
} from '../registry';
import { cliAddCommand, installHint } from '../install-hint';
import { failJson, okJson } from '../result';
import { utf8ByteLength } from '../utf8';

export const getComponentInput = {
  name: z.string().describe('Registry component name (e.g. button, card)'),
  includeSource: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'If true, include free-tier source file contents. Pro source is never returned via MCP in V1.'
    ),
};

export async function getComponent(args: { name: string; includeSource?: boolean }) {
  try {
    const name = args.name.trim();
    if (!isSafeItemName(name)) {
      return failJson(`Invalid component name: '${name}'.`);
    }

    const index = await fetchIndex();
    const entry = index.find((i) => i.name === name);
    if (!entry) {
      const suggestions = suggestNames(
        name,
        index.map((i) => i.name)
      );
      return failJson(`Unknown component: '${name}'.`, {
        suggestions,
        listHint: 'Call list_components or search_components.',
      });
    }

    const base = {
      ok: true as const,
      name: entry.name,
      tier: entry.tier,
      category: entry.category || 'component',
      description: entry.description || '',
      usage: entry.usage || '',
      keywords: entry.keywords || [],
      dependencies: entry.dependencies,
      registryDependencies: entry.registryDependencies,
      docsUrl: `${SITE_URL}`,
      pricingUrl: `${SITE_URL}/pricing`,
    };

    if (entry.tier === 'pro') {
      return okJson({
        ...base,
        source: null,
        installCommand: cliAddCommand(name),
        note: `Pro component — metadata only. ${installHint(name)} Pro install also needs PLY_LICENSE_KEY. Buy at ${SITE_URL}/pricing.`,
      });
    }

    const item = await fetchFreeItem(name);
    const files = item.files.map((f) => ({
      path: f.name,
      bytes: utf8ByteLength(f.content),
      ...(args.includeSource ? { content: f.content } : {}),
    }));

    return okJson({
      ...base,
      files,
      includeSource: Boolean(args.includeSource),
      installCommand: cliAddCommand(name),
      note: args.includeSource
        ? `Free source included for reading. ${installHint(name)}`
        : `Source omitted by default. Pass includeSource=true to read free files here. ${installHint(name)}`,
    });
  } catch (err: any) {
    return failJson(err.message || String(err));
  }
}
