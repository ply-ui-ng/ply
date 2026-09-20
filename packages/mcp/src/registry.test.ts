import { describe, expect, it } from 'vitest';
import { isSafeItemName, itemHaystack, itemLicense, hubSourceUrl, suggestNames } from './registry';

describe('registry helpers', () => {
  it('accepts safe item names', () => {
    expect(isSafeItemName('button')).toBe(true);
    expect(isSafeItemName('form-login')).toBe(true);
    expect(isSafeItemName('../evil')).toBe(false);
    expect(isSafeItemName('')).toBe(false);
  });

  it('ranks fuzzy suggestions', () => {
    const names = ['button', 'icon-button', 'button-group', 'card', 'dialog'];
    expect(suggestNames('buton', names, 3)[0]).toBe('button');
    expect(suggestNames('dialog modal', names, 3)).toContain('dialog');
  });

  it('matches description and keyword tokens in the haystack', () => {
    const hay = itemHaystack({
      name: 'dialog',
      description: 'A service for dynamically rendering dialogs and modals.',
      usage: 'inject(DialogService).open(MyDialog)',
      keywords: ['modal', 'overlay'],
    });
    expect(hay).toContain('modal');
    expect(hay).toContain('dialog');
    expect(hay).toContain('inject(dialogservice)');
  });

  it('maps registry tiers to SPDX-style license labels', () => {
    expect(itemLicense('free')).toBe('MIT');
    expect(itemLicense('pro')).toBe('Ply Pro');
    expect(hubSourceUrl('badge')).toBe('https://github.com/ply-ui-ng/ply/tree/main/components/badge');
  });
});
