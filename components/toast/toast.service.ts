import {
  Injectable,
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ToastComponent } from './toast.component';
import { ToastAction, ToastColor, ToastPosition } from '../types';

/**
 * Options passed to ToastService.show and the color shortcuts.
 *
 * @example
 * this.toast.show('Saved', { color: 'success', action: { label: 'Undo', onClick: restore } });
 */
export interface ToastConfig {
  /** Semantic color of the toast. Defaults to `primary`. */
  color?: ToastColor;
  /** Auto-dismiss delay in ms. `0` keeps the toast until dismissed. Defaults to 4000. */
  duration?: number;
  /** `ply-icon` name. Defaults from `color` when omitted. */
  icon?: string;
  /** Viewport corner. Defaults to `top-right`. */
  position?: ToastPosition;
  /** Optional inline button (e.g. Undo). `{ label, onClick, dismiss? }`. */
  action?: ToastAction;
}

/**
 * Status messages for ToastService.promise.
 *
 * @example
 * await this.toast.promise(save(), { loading: 'Saving…', success: 'Saved', error: 'Failed' });
 */
export interface ToastPromiseMessages<T> {
  /** Shown while the promise is pending (`duration: 0`). */
  loading: string;
  /** Shown on resolve. */
  success: string | ((data: T) => string);
  /** Shown on reject. */
  error: string | ((err: unknown) => string);
}

export interface ToastItem {
  id: number;
  message: string;
  color: ToastColor;
  icon: string;
  duration: number;
  position: ToastPosition;
  removing: boolean;
  action?: ToastAction;
}

/**
 * Imperative stacked toast API with expandable deck, swipe-to-dismiss, hover pause, and a reduced-motion static list.
 * SSR-safe: skips DOM work off the browser; creates and appends the host via `DOCUMENT`.
 * Do not place `ply-toast-container` in templates.
 *
 * @example
 * this.toast.success('Copied');
 * this.toast.show('Deleted', { action: { label: 'Undo', onClick: () => restore() } });
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly document = inject(DOCUMENT);
  private appRef = inject(ApplicationRef);
  private environmentInjector = inject(EnvironmentInjector);

  private hostEl?: HTMLElement;
  private toastRef?: ComponentRef<ToastComponent>;
  private toastComponent?: ToastComponent;
  private nextId = 0;
  private defaultDuration = 4000;

  private ensureContainer() {
    if (this.hostEl || !this.isBrowser) return;

    const hostEl = this.document.createElement('div');
    hostEl.setAttribute('aria-live', 'polite');
    hostEl.setAttribute('aria-relevant', 'additions removals');
    this.document.body.appendChild(hostEl);

    const componentRef = createComponent(ToastComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: hostEl,
    });

    this.appRef.attachView(componentRef.hostView);
    this.toastRef = componentRef;
    this.toastComponent = componentRef.instance;
    this.hostEl = hostEl;
    this.toastRef.changeDetectorRef.detectChanges();
  }

  private refresh() {
    this.toastRef?.changeDetectorRef.detectChanges();
  }

  /**
   * Shows a toast and returns its id.
   * @example
   * const id = this.toast.show('Hello', { duration: 0 });
   */
  show(message: string, config: ToastConfig = {}): number {
    this.ensureContainer();
    if (!this.toastComponent) return 0;

    const id = ++this.nextId;
    const toast: ToastItem = {
      id,
      message,
      color: config.color || 'primary',
      icon: config.icon || this.getDefaultIcon(config.color),
      duration: config.duration ?? this.defaultDuration,
      position: config.position || 'top-right',
      removing: false,
      action: config.action,
    };

    this.toastComponent.addToast(toast);
    this.refresh();
    return id;
  }

  /**
   * Dismisses a toast by id.
   * @example
   * this.toast.dismiss(id);
   */
  dismiss(id: number) {
    this.toastComponent?.dismissById(id);
    this.refresh();
  }

  /**
   * Success toast.
   * @example
   * this.toast.success('Saved');
   */
  success(message: string, config?: ToastConfig): number {
    return this.show(message, { ...config, color: 'success', icon: 'check' });
  }

  /**
   * Error toast.
   * @example
   * this.toast.error('Could not save');
   */
  error(message: string, config?: ToastConfig): number {
    return this.show(message, { ...config, color: 'danger', icon: 'alert-triangle' });
  }

  /**
   * Warning toast.
   * @example
   * this.toast.warning('Session expires soon');
   */
  warning(message: string, config?: ToastConfig): number {
    return this.show(message, { ...config, color: 'warning', icon: 'alert-circle' });
  }

  /**
   * Info toast.
   * @example
   * this.toast.info('3 new messages');
   */
  info(message: string, config?: ToastConfig): number {
    return this.show(message, { ...config, color: 'primary', icon: 'info-circle' });
  }

  /**
   * Loading toast that resolves to success or error when the promise settles.
   * @example
   * await this.toast.promise(save(), {
   *   loading: 'Saving…',
   *   success: 'Saved',
   *   error: (e) => String(e),
   * });
   */
  promise<T>(
    promiseOrFn: Promise<T> | (() => Promise<T>),
    messages: ToastPromiseMessages<T>,
    config?: ToastConfig,
  ): Promise<T> {
    const pending = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;
    const id = this.show(messages.loading, {
      ...config,
      duration: 0,
      color: 'primary',
      icon: config?.icon || 'loader',
    });

    return pending.then(
      (data) => {
        this.dismiss(id);
        const message =
          typeof messages.success === 'function' ? messages.success(data) : messages.success;
        this.success(message, config);
        return data;
      },
      (err: unknown) => {
        this.dismiss(id);
        const message = typeof messages.error === 'function' ? messages.error(err) : messages.error;
        this.error(message, config);
        throw err;
      },
    );
  }

  /**
   * Dismisses every visible toast.
   * @example
   * this.toast.clearAll();
   */
  clearAll() {
    this.toastComponent?.dismissAll();
    this.refresh();
  }

  private getDefaultIcon(color?: ToastColor): string {
    switch (color) {
      case 'success':
        return 'check';
      case 'danger':
        return 'alert-triangle';
      case 'warning':
        return 'alert-circle';
      case 'primary':
        return 'info-circle';
      case 'accent':
        return 'help-circle';
      default:
        return 'info-circle';
    }
  }
}
