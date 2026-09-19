import { Component,
  TemplateRef,
  viewChild,
  input,
  output
,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { DrawerPanel } from './drawer-panel';
import {
  slideBottom,
  slideLeft,
  slideRight,
  slideTop
} from '../animations/animations';
import { IconComponent } from '../icon/icon.component';
import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { DrawerPosition, DrawerSize } from '../types';

/**
 * A side-drawer/offcanvas component that slides in from the edge of the screen.
 * Managed automatically by the DrawerService, or can be used inline.
 *
 * @example
 * <ply-drawer position="right" size="lg" (closed)="onDrawerClose()"></ply-drawer>
 */
@Component({
  selector: 'ply-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, A11yModule, IconComponent, IconButtonDirective],
  templateUrl: './drawer.component.html',
  animations: [slideLeft, slideRight, slideTop, slideBottom]
})
export class DrawerComponent<T> implements DrawerPanel<T> {
  /** The size of the drawer. Defaults to 'md'. */
  readonly size = input<DrawerSize>('md');

  /** The edge of the screen to slide in from. Defaults to 'right'. */
  readonly position = input<DrawerPosition>('right');

  /** Triggers the closing animation when set to true. */
  readonly close = input(false, { transform: booleanAttribute });

  /** Accessible name for the drawer dialog. */
  readonly drawerLabel = input('Drawer');

  readonly templateRef = viewChild.required(TemplateRef);

  /** Event emitted when the drawer has fully closed. */
  readonly closed = output<void>();
}
