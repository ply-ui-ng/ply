import { focusMenuItem, focusMenuItemEdge, focusMenuItemTypeahead, getMenuItems } from './a11y-keyboard';

describe('a11y-keyboard', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <button role="menuitem" tabindex="-1">Alpha</button>
      <button role="menuitem" tabindex="-1">Beta</button>
      <button role="menuitem" tabindex="-1" disabled>Closed</button>
      <button role="menuitem" tabindex="-1">Gamma</button>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('collects enabled menu items', () => {
    expect(getMenuItems(container).length).toBe(3);
  });

  it('moves focus forward and backward among menu items', () => {
    const items = getMenuItems(container);
    items[0].focus();

    focusMenuItem(container, items[0], 1);
    expect(document.activeElement).toBe(items[1]);

    focusMenuItem(container, items[1], -1);
    expect(document.activeElement).toBe(items[0]);
  });

  it('focuses first and last menu items', () => {
    const items = getMenuItems(container);

    focusMenuItemEdge(container, 'last');
    expect(document.activeElement).toBe(items[2]);

    focusMenuItemEdge(container, 'first');
    expect(document.activeElement).toBe(items[0]);
  });

  it('typeahead focuses the next item starting with that letter', () => {
    const items = getMenuItems(container);
    items[0].focus();

    focusMenuItemTypeahead(container, 'g', items[0]);
    expect(document.activeElement).toBe(items[2]);
  });

  it('typeahead wraps and skips disabled items', () => {
    const items = getMenuItems(container);
    items[2].focus();

    focusMenuItemTypeahead(container, 'a', items[2]);
    expect(document.activeElement).toBe(items[0]);

    focusMenuItemTypeahead(container, 'c', items[0]);
    expect(document.activeElement).toBe(items[0]);
  });
});
