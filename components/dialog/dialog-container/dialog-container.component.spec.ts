import { FocusTrapFactory } from '@angular/cdk/a11y';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogContainerComponent } from './dialog-container.component';
import { DialogContext } from '../dialog-context';

describe('DialogContainerComponent a11y', () => {
  let fixture: ComponentFixture<DialogContainerComponent>;
  let component: DialogContainerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogContainerComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: FocusTrapFactory,
          useValue: {
            create: () => ({
              focusInitialElementWhenReady: () => undefined,
              destroy: () => undefined,
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogContainerComponent);
    component = fixture.componentInstance;
    const context = new DialogContext();
    vi.spyOn(context, 'close');
    component.context = context;
    fixture.detectChanges();
  });

  it('renders dialog semantics on the dialog box', () => {
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('closes on Escape via dialog context', () => {
    component.onEscape();
    expect(component.context.close).toHaveBeenCalled();
  });

  it('sets aria-labelledby when a heading is present', () => {
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    const heading = document.createElement('h2');
    heading.textContent = 'Confirm action';
    dialog.appendChild(heading);
    component.applyDialogLabelling();

    expect(dialog.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(dialog.getAttribute('aria-label')).toBeNull();
  });

  it('falls back to i18n.dialog when there is no heading', () => {
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.getAttribute('aria-label')).toBe('Dialog');
  });
});
