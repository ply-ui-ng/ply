import { describe, expect, it } from 'vitest';
import { GITHUB_HUB_URL } from './brand';
import { installLicenseLine } from './license-note';

describe('installLicenseLine', () => {
  it('prints the public MIT tree for free items', () => {
    expect(installLicenseLine('badge', 'free')).toBe(
      `  MIT  ${GITHUB_HUB_URL}/tree/main/components/badge`,
    );
  });

  it('does not invent a public source URL for Pro items', () => {
    const line = installLicenseLine('datepicker', 'pro');
    expect(line).toContain('Ply Pro');
    expect(line).toContain('LICENSE-PRO.md');
    expect(line).not.toContain('/tree/main/components/');
  });
});
