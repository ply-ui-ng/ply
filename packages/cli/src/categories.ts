/** Registry `category` values, in the order `list` and the add picker show them. */
export const CATEGORY_TITLES: Record<string, string> = {
  application: 'Applications',
  'page-layout': 'Page layouts',
  block: 'Blocks',
  widget: 'Widgets',
  shell: 'Shells',
  component: 'Components',
};

export const CATEGORY_ORDER = [
  'application',
  'page-layout',
  'block',
  'widget',
  'shell',
  'component',
] as const;

export function categoryTitle(category?: string): string {
  const key = category || 'component';
  return CATEGORY_TITLES[key] || key;
}
