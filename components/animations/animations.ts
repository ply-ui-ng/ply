import {
  trigger,
  style,
  animate,
  transition
} from '@angular/animations';

/**
 * Slide-down fade-in animation for dropdown menus and overlays.
 * On enter the element fades in while translating downward; on leave it fades out instantly.
 *
 * @example
 * <div [@dropdown]>
 *   <ply-dropdown-menu>...</ply-dropdown-menu>
 * </div>
 */
export const dropdown = trigger('dropdown', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'translateY(15px)',
    }),
    animate(
      '.3s .1s',
      style({
        opacity: 1,
        transform: 'translateY(0)',
      })
    )]),
  transition(':leave', [
    style({
      opacity: 1,
    }),
    animate(
      '.0s',
      style({
        opacity: 0,
      })
    )])]);

/**
 * Expand/collapse animation for accordions and collapsible panels.
 * Uses Angular's wildcard `*` to animate from/to the element's natural height.
 *
 * @example
 * <div [@openClose]>
 *   <ply-accordion-item-body>Content</ply-accordion-item-body>
 * </div>
 */
export const openClose = trigger('openClose', [
  transition(':enter', [
    style({
      height: '0',
      opacity: 0,
    }),
    animate(
      '.3s',
      style({
        height: '*',
        opacity: 1,
      })
    )]),
  transition(':leave', [
    style({
      height: '*',
    }),
    animate(
      '.3s',
      style({
        height: 0,
        opacity: 0,
      })
    )])]);

/**
 * 180-degree rotation animation, useful for chevron toggles (expand/collapse icons).
 * Enter goes from 0° to 180°; leave reverses back to 0°.
 *
 * @example
 * <button [@rotate180]>
 *   <ply-icon name="chevron-down"></ply-icon>
 * </button>
 */
export const rotate180 = trigger('rotate180', [
  transition(':enter', [
    style({
      transform: 'rotate(0deg)',
    }),
    animate(
      '.3s',
      style({
        transform: 'rotate(180deg)',
      })
    )]),
  transition(':leave', [
    style({
      transform: 'rotate(180deg)',
    }),
    animate(
      '.3s',
      style({
        transform: 'rotate(0deg)',
      })
    )])]);

/**
 * Horizontal slide animation for tab content panes.
 * New content slides in from the right; old content slides out to the left.
 *
 * @example
 * <div [@tabAnimation]>
 *   <ply-tab-body>Tab content</ply-tab-body>
 * </div>
 */
export const tabAnimation = trigger('tabAnimation', [
  transition(':enter', [
    style({
      transform: 'translateX(100%)',
    }),
    animate(
      '.3s',
      style({
        transform: 'translateX(0)',
      })
    )]),
  transition(':leave', [
    style({
      transform: 'translateX(0)',
    }),
    animate(
      '.3s',
      style({
        transform: 'translateX(-100%)',
      })
    )])]);

/**
 * Slide-right-to-left animation for action buttons that appear/disappear inline.
 *
 * @example
 * <button [@buttonSlideRightToLeft]>Save</button>
 */
export const buttonSlideRightToLeft = trigger('buttonSlideRightToLeft', [
  transition(':enter', [
    style({
      marginInlineEnd: '-40px',
      opacity: 0,
    }),
    animate(
      '.3s',
      style({
        marginInlineEnd: '0',
        opacity: 1,
      })
    )]),
  transition(':leave', [
    style({
      marginInlineEnd: '0',
      opacity: 1,
    }),
    animate(
      '.3s',
      style({
        marginInlineEnd: '-40px',
        opacity: 0,
      })
    )])]);

/**
 * Slide-in from the left animation.
 *
 * @example
 * <div [@slideLeft]>
 *   Sidebar content
 * </div>
 */
export const slideLeft = trigger('slideLeft', [
  transition(':enter', [
    style({
      marginLeft: '-100%',
      opacity: 0,
    }),
    animate(
      '.3s',
      style({
        marginLeft: '0',
        opacity: 1,
      })
    )]),
  transition(':leave', [
    style({
      marginLeft: '0',
      opacity: 1,
    }),
    animate(
      '.3s',
      style({
        marginLeft: '-100%',
        opacity: 0,
      })
    )])]);

/**
 * Slide-in from the right animation.
 *
 * @example
 * <div [@slideRight]>
 *   Panel content
 * </div>
 */
export const slideRight = trigger('slideRight', [
  transition(':enter', [
    style({
      marginRight: '-100%',
      opacity: 0,
    }),
    animate(
      '.3s',
      style({
        marginRight: '0',
        opacity: 1,
      })
    )]),
  transition(':leave', [
    style({
      marginRight: '0',
      opacity: 1,
    }),
    animate(
      '.3s',
      style({
        marginRight: '-100%',
        opacity: 0,
      })
    )])]);

/**
 * Slide-in from the bottom animation.
 *
 * @example
 * <div [@slideBottom]>
 *   Notification bar
 * </div>
 */
export const slideBottom = trigger('slideBottom', [
  transition(':enter', [
    style({
      marginBottom: '-100%',
      opacity: 0,
    }),
    animate(
      '.3s',
      style({
        marginBottom: '0',
        opacity: 1,
      })
    )]),
  transition(':leave', [
    style({
      marginBottom: '0',
      opacity: 1,
    }),
    animate(
      '.3s',
      style({
        marginBottom: '-100%',
        opacity: 0,
      })
    )])]);

/**
 * Slide-in from the top animation.
 *
 * @example
 * <div [@slideTop]>
 *   Dropdown content
 * </div>
 */
export const slideTop = trigger('slideTop', [
  transition(':enter', [
    style({
      marginTop: '-100%',
      opacity: 0,
    }),
    animate(
      '.3s',
      style({
        marginTop: '0',
        opacity: 1,
      })
    )]),
  transition(':leave', [
    style({
      marginTop: '0',
      opacity: 1,
    }),
    animate(
      '.3s',
      style({
        marginTop: '-100%',
        opacity: 0,
      })
    )])]);
