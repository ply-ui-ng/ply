import axe, { type Result, type RunOptions } from 'axe-core';

/**
 * Test-runner assertion API (vitest globals). Declared here so this helper
 * type-checks under tsconfig.lib.json, where the spec globals are excluded.
 */
declare const expect: (actual: unknown, message?: string) => { toEqual(expected: unknown): void };

/**
 * Rules that are unreliable or meaningless under jsdom (no layout / no real
 * computed colors). Browser / Storybook / CI visual checks still cover them.
 */
const JSDOM_DISABLED_RULES = ['color-contrast', 'link-in-text-block'];

function formatViolations(violations: Result[]): string {
  if (!violations.length) return '';
  return violations
    .map((v) => {
      const nodes = v.nodes.map((n) => `  - ${n.target.join(' > ')}: ${n.failureSummary}`).join('\n');
      return `${v.id} (${v.impact}): ${v.help}\n${nodes}`;
    })
    .join('\n\n');
}

/**
 * Run axe-core against a DOM subtree and fail the test on WCAG 2.x A/AA
 * violations (jsdom-safe rule set).
 *
 * @example
 * ```ts
 * fixture.detectChanges();
 * await expectNoA11yViolations(fixture.nativeElement);
 * ```
 */
export async function expectNoA11yViolations(element: Element, options: RunOptions = {}): Promise<void> {
  const results = await axe.run(element, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
    },
    rules: Object.fromEntries(JSDOM_DISABLED_RULES.map((id) => [id, { enabled: false }])),
    ...options,
  });

  expect(results.violations, formatViolations(results.violations)).toEqual([]);
}
