import { ConnectedPosition } from '@angular/cdk/overlay';

/**
 * Placement union shared by popover/hover-card overlays. Mirrors
 * {@link PopoverPlacement} from `types/`.
 */
export type OverlayPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end';

const FLIP: Record<OverlayPlacement, OverlayPlacement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
  'top-start': 'bottom-start',
  'top-end': 'bottom-end',
  'bottom-start': 'top-start',
  'bottom-end': 'top-end',
};

/**
 * CDK `ConnectedPosition` map for a given gap. Previously duplicated
 * byte-for-byte in `popover` and `hover-card`.
 */
function buildPositions(gap: number): Record<OverlayPlacement, ConnectedPosition> {
  return {
    'bottom-start': {
      originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: gap,
    },
    'bottom-end': {
      originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: gap,
    },
    bottom: {
      originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: gap,
    },
    'top-start': {
      originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -gap,
    },
    'top-end': {
      originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -gap,
    },
    top: {
      originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -gap,
    },
    left: {
      originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -gap,
    },
    right: {
      originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: gap,
    },
  };
}

/**
 * Preferred + flipped fallback positions for a CDK `Overlay` panel.
 *
 * @example
 * this.overlayRef = this.overlay.create({
 *   positionStrategy: this.overlay
 *     .position()
 *     .flexibleConnectedTo(trigger)
 *     .withPositions(overlayPositions(this.placement(), 8))
 *     .withViewportMargin(8),
 * });
 */
export function overlayPositions(
  placement: OverlayPlacement,
  gap = 8,
): ConnectedPosition[] {
  const map = buildPositions(gap);
  return [map[placement] ?? map['bottom-start'], map[FLIP[placement] ?? 'top-start']];
}

/** Rectangle subset needed by {@link overlayDropUpMetrics}. */
export interface OverlayTriggerRect {
  left: number;
  top: number;
  bottom: number;
  width: number;
}

/** Fixed-position styles for a dropdown rendered below/above a trigger. */
export interface OverlayDropUpMetrics {
  /** True when the panel opens upward because there is not enough space below. */
  dropUp: boolean;
  width: string;
  left: string;
  top: string;
  bottom: string;
}

/**
 * Computes the drop-up decision and fixed-position styles for a dropdown
 * panel. Previously duplicated in `select-tree`, `multi-select`, and the
 * hand-rolled select dropdowns.
 *
 * @example
 * const metrics = overlayDropUpMetrics(
 *   trigger.getBoundingClientRect(),
 *   window.innerHeight,
 *   320,
 *   8,
 * );
 * this.dropdownWidth.set(metrics.width);
 */
export function overlayDropUpMetrics(
  rect: OverlayTriggerRect,
  viewportHeight: number,
  panelHeight: number,
  gap = 8,
): OverlayDropUpMetrics {
  const spaceBelow = viewportHeight - rect.bottom;
  const spaceAbove = rect.top;
  const dropUp = spaceBelow < panelHeight && spaceAbove > spaceBelow;

  return {
    dropUp,
    width: `${rect.width}px`,
    left: `${rect.left}px`,
    top: dropUp ? 'auto' : `${rect.bottom + gap}px`,
    bottom: dropUp ? `${viewportHeight - rect.top + gap}px` : 'auto',
  };
}

/**
 * Absolute `top`/`left` for a tooltip anchored to `hostRect`, in document
 * coordinates (i.e. already including `scrollPos`).
 */
export function tooltipAbsolutePosition(
  hostRect: { top: number; bottom: number; left: number; right: number; width: number; height: number },
  tooltipRect: { width: number; height: number },
  placement: 'top' | 'bottom' | 'left' | 'right',
  offset: number,
  scrollPos: number,
): { top: number; left: number } {
  switch (placement) {
    case 'top':
      return {
        top: hostRect.top - tooltipRect.height - offset + scrollPos,
        left: hostRect.left + (hostRect.width - tooltipRect.width) / 2,
      };
    case 'bottom':
      return {
        top: hostRect.bottom + offset + scrollPos,
        left: hostRect.left + (hostRect.width - tooltipRect.width) / 2,
      };
    case 'left':
      return {
        top: hostRect.top + (hostRect.height - tooltipRect.height) / 2 + scrollPos,
        left: hostRect.left - tooltipRect.width - offset,
      };
    case 'right':
      return {
        top: hostRect.top + (hostRect.height - tooltipRect.height) / 2 + scrollPos,
        left: hostRect.right + offset,
      };
  }
}
