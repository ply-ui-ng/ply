import { InjectionToken, Signal } from '@angular/core';
import { GroupButtonSize } from '../types';

/**
 * Minimal parent API that group button items need from `ply-button-group`.
 * Kept in a separate file to avoid a circular import with `GroupButtonComponent`.
 */
export interface ButtonGroupParent {
  readonly size: Signal<GroupButtonSize>;
}

/** Injection token so group button items can read parent size without circular imports. */
export const BUTTON_GROUP = new InjectionToken<ButtonGroupParent>('ButtonGroup');
