/**
 * Centralized z-index scale for fixed-position overlays.
 *
 * Dialogs and drawers share the overlay band; popovers sit above them and
 * toasts/tooltips on top. Tailwind classes in templates should reference the
 * values below (e.g. `z-1000` for dialogs, `z-[1200]` for toasts).
 */
export const Z_SCALE = {
  /** Sticky headers/nav (z-50). */
  sticky: 50,
  /** Dialogs, drawers, bottom sheets, lightboxes (z-1000 band). */
  overlay: 1000,
  /** Dropdowns, menus, popovers (z-1100 band). */
  popover: 1100,
  /** Toasts, tooltips, notifications (z-[1200] band). */
  toast: 1200,
} as const;
