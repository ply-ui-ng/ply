/**
 * shadcn / common names that install a different registry folder.
 * `npx ply-ui-cli add sheet` copies `drawer`.
 */
export const COMPONENT_ALIASES: Record<string, string> = {
  sheet: 'drawer',
  'side-sheet': 'drawer',
  gallery: 'slider',
  'image-slider': 'slider',
  slideshow: 'slider',
  range: 'range-slider',
  'slider-input': 'range-slider',
  'input-slider': 'range-slider',
  'base-list-item': 'ply-list-item',
  'base-tab-icon': 'ply-tab-icon',
  'base-group-button': 'ply-group-button',
  'base-dropdown-menu-item': 'ply-dropdown-menu-item',
  'base-context-menu-item': 'ply-context-menu-item',
};

export function canonicalComponentName(name: string): string {
  const key = name.trim().toLowerCase();
  return COMPONENT_ALIASES[key] ?? name.trim();
}

export function resolveComponentNames(names: string[]): { requested: string; canonical: string }[] {
  return names.map((requested) => ({
    requested,
    canonical: canonicalComponentName(requested),
  }));
}
