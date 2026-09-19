/** Collect focusable menu items inside a menu container. */
export function getMenuItems(container: ParentNode): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      '[role^="menuitem"]:not([aria-disabled="true"]):not([disabled])'
    )
  );
}

/** Move focus among menu items; returns the newly focused element. */
export function focusMenuItem(
  container: ParentNode,
  current: HTMLElement | null,
  delta: number
): HTMLElement | null {
  const items = getMenuItems(container);
  if (!items.length) return null;

  const index = current ? items.indexOf(current) : -1;
  const next = items[(index + delta + items.length) % items.length];
  next.focus();
  return next;
}

/** Focus first or last menu item. */
export function focusMenuItemEdge(
  container: ParentNode,
  edge: 'first' | 'last'
): HTMLElement | null {
  const items = getMenuItems(container);
  if (!items.length) return null;
  const target = edge === 'first' ? items[0] : items[items.length - 1];
  target.focus();
  return target;
}

/**
 * Typeahead: focus the next enabled item whose label starts with `char`.
 * Search wraps from the item after `current`. Used by dropdown and context menus
 * (roving tabindex). Combobox / select / command-palette keep aria-activedescendant.
 */
export function focusMenuItemTypeahead(
  container: ParentNode,
  char: string,
  current: HTMLElement | null
): HTMLElement | null {
  if (!char) return null;
  const items = getMenuItems(container);
  if (!items.length) return null;

  const needle = char.toLowerCase();
  const start = items.indexOf(current!) + 1;
  for (let i = 0; i < items.length; i++) {
    const item = items[(start + i) % items.length];
    if (item.textContent?.trim().toLowerCase().startsWith(needle)) {
      item.focus();
      return item;
    }
  }
  return null;
}
