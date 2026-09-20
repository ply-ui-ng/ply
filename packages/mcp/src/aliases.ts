/** Keep in sync with packages/cli/src/aliases.ts */
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
