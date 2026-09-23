import {
  ComponentRef,
  Injectable,
  Injector,
  Type,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ComponentPortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogContainer } from './dialog-container';
import { DialogContainerComponent } from './dialog-container/dialog-container.component';
import { DialogContext } from './dialog-context';
import { AlertDialogComponent } from './alert-dialog/alert-dialog.component';
import { AlertDialogData } from './alert-dialog/alert-dialog.types';
import { injectDocumentDirection } from '../direction/inject-direction';
import { BASE_UI_I18N } from '../i18n/i18n';

/**
 * A service for dynamically rendering and managing dialogs/modals.
 * SSR-safe: `open()` is a no-op on the server and returns `of(undefined)`.
 * Hosts attach through CDK Overlay (`.cdk-overlay-container`). Unit tests: `DialogHarness` with
 * `TestbedHarnessEnvironment.documentRootLoader(fixture)` (the overlay is outside the fixture).
 *
 * @example
 * private readonly dialog = inject(DialogService);
 *
 * openMyModal() {
 *   this.dialog.open<UserData, ConfirmResult>(MyCustomModalComponent, { user: this.user })
 *     .subscribe(result => {
 *       console.log('Dialog closed with:', result);
 *     });
 * }
 */
@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly writingDirection = injectDocumentDirection();
  private overlay = inject(Overlay);
  private injector = inject(Injector);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly i18n = inject(BASE_UI_I18N);

  /**
   * Opens a component dynamically inside a dialog container.
   * On the server this returns `of(undefined)` and does not touch the DOM.
   *
   * @param type The Angular component class to render inside the dialog.
   * @param data Optional data to pass to the component. Injected via DialogContext.
   * @param className Optional CSS classes to apply to the dialog container wrapper.
   * @param options Configuration options for the dialog behavior (e.g. hideOnBackdropClick).
   * @returns An Observable that emits the result once, when the dialog is closed.
   * @example
   * this.dialog.open(ConfirmDialog).subscribe((ok) => { if (ok) save(); });
   */
  open<TData = unknown, TResult = TData>(
    type: Type<unknown>,
    data?: TData,
    className?: string,
    options: { hideOnBackdropClick?: boolean; containerType?: Type<DialogContainer> } = {}
  ): Observable<TResult | undefined> {
    if (!this.isBrowser) {
      return of(undefined);
    }

    const dialogResult = new Subject<TResult | undefined>();
    const finalOptions = {
      hideOnBackdropClick: true,
      containerType: DialogContainerComponent,
      ...options
    };

    const { containerRef, overlayRef } = this.createContainer(finalOptions.containerType);
    containerRef.instance.className = className || '';
    containerRef.changeDetectorRef.detectChanges();

    const dialogContext = new DialogContext<TData, TResult>();
    dialogContext.data = data;

    if (finalOptions.hideOnBackdropClick !== false) {
      containerRef.instance.context = dialogContext as DialogContext<unknown, unknown>;
      containerRef.changeDetectorRef.detectChanges();
    }

    const dialogInjector = Injector.create({
      providers: [{ provide: DialogContext, useValue: dialogContext }],
      parent: containerRef.instance.container().injector
    });

    containerRef.instance.container().createComponent(type, {
      index: 0,
      injector: dialogInjector
    });

    dialogContext.promise(containerRef, overlayRef).then(result => {
      dialogResult.next(result);
      dialogResult.complete();
    });

    containerRef.changeDetectorRef.detectChanges();
    containerRef.instance.applyDialogLabelling?.();

    return dialogResult.asObservable();
  }

  /**
   * Opens a confirm / alert dialog and emits `true` only when the user
   * confirms. Backdrop, Escape, and Cancel emit `false`. SSR-safe: emits
   * `false` on the server and does not touch the DOM.
   *
   * @example
   * this.dialog.confirm({ title: 'Delete file?', destructive: true })
   *   .subscribe((ok) => { if (ok) remove(); });
   */
  confirm(options: {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
  }): Observable<boolean> {
    if (!this.isBrowser) {
      return of(false);
    }

    const data: AlertDialogData = {
      title: options.title,
      description: options.description,
      confirmLabel: options.confirmLabel ?? this.i18n.confirm,
      cancelLabel: options.cancelLabel ?? this.i18n.cancel,
      destructive: options.destructive ?? false,
    };

    return this.open<AlertDialogData, boolean>(AlertDialogComponent, data).pipe(
      map((result) => result === true),
    );
  }

  private createContainer(
    containerType: Type<DialogContainer>,
  ): { containerRef: ComponentRef<DialogContainer>; overlayRef: OverlayRef } {
    const overlayRef = this.overlay.create({
      direction: this.writingDirection(),
      hasBackdrop: false,
      positionStrategy: this.overlay.position().global().top('0').left('0'),
      width: '100%',
      height: '100%',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      panelClass: 'ply-dialog-overlay-pane',
      disposeOnNavigation: true,
    });
    overlayRef.overlayElement.style.overflow = 'visible';
    const containerRef = overlayRef.attach(new ComponentPortal(containerType, null, this.injector));
    return { containerRef, overlayRef };
  }
}
