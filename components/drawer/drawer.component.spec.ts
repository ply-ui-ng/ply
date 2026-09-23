import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DirectionRegistry } from '../direction/direction.service';
import { DrawerComponent } from './drawer.component';

describe('DrawerComponent', () => {
  let component: DrawerComponent<unknown>;
  let fixture: ComponentFixture<DrawerComponent<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(DrawerComponent<unknown>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.documentElement.removeAttribute('dir');
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render content', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });

  it('opens the end drawer from the right in LTR and the left in RTL', () => {
    expect(panelClass(fixture)).toContain('right-0');

    TestBed.inject(DirectionRegistry).setDocumentDirection('rtl');
    fixture.detectChanges();

    expect(panelClass(fixture)).toContain('left-0');
    expect(panelClass(fixture)).not.toContain('right-0');
  });

  it('keeps an explicit right drawer on the right in RTL', () => {
    fixture.componentRef.setInput('position', 'right');
    TestBed.inject(DirectionRegistry).setDocumentDirection('rtl');
    fixture.detectChanges();

    expect(panelClass(fixture)).toContain('right-0');
  });
});

function panelClass(fixture: ComponentFixture<DrawerComponent<unknown>>): string {
  const view = fixture.componentInstance.templateRef().createEmbeddedView(null);
  view.detectChanges();
  const panel = view.rootNodes.find((node): node is HTMLElement => node instanceof HTMLElement);
  const className = panel?.className ?? '';
  view.destroy();
  return className;
}
