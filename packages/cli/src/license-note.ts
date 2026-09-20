import { GITHUB_HUB_URL } from './brand';

/** One line printed after a successful `add`, so the install states the license. */
export function installLicenseLine(name: string, tier: 'free' | 'pro'): string {
  if (tier === 'pro') {
    return '  Ply Pro — licensed; see LICENSE-PRO.md';
  }
  return `  MIT  ${GITHUB_HUB_URL}/tree/main/components/${name}`;
}
