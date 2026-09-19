import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressButtonComponent } from './progress-button.component';

describe('ProgressButtonComponent', () => {
  let component: ProgressButtonComponent;
  let fixture: ComponentFixture<ProgressButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  function button(): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector('button')!;
  }

  function spinnerEl(): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('.animate-spin');
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the label and no spinner by default', () => {
    expect(spinnerEl()).toBeNull();
  });

  it('should show a spinner and hide the label while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(spinnerEl()).toBeTruthy();
    expect(button().querySelector('span')!.classList.contains('opacity-0')).toBe(true);
    expect(button().getAttribute('aria-disabled')).toBe('true');
    expect(button().getAttribute('aria-busy')).toBe('true');
  });

  it('should block interaction without any disabled styling while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(button().disabled).toBe(false);
    expect(button().style.opacity).toBe('');
    expect(button().classList.contains('pointer-events-none')).toBe(true);
    let clicks = 0;
    component.clicked.subscribe(() => clicks++);
    button().click();
    expect(clicks).toBe(0);
  });

  it('should render a 20px spinner on the default size', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(spinnerEl()!.style.width).toBe('20px');
    expect(spinnerEl()!.style.height).toBe('20px');
  });

  it('should scale the spinner proportionally with the button size', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('size', 'xxl');
    fixture.detectChanges();
    expect(spinnerEl()!.style.width).toBe('32px');
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    expect(spinnerEl()!.style.width).toBe('16px');
  });

  it('should emit clicked when enabled and not loading', () => {
    let clicks = 0;
    component.clicked.subscribe(() => clicks++);
    button().click();
    expect(clicks).toBe(1);
  });

  it('should not emit clicked while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    let clicks = 0;
    component.clicked.subscribe(() => clicks++);
    button().click();
    expect(clicks).toBe(0);
  });

  it('should map the button color to a visible spinner color', () => {
    fixture.componentRef.setInput('color', 'black');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(spinnerEl()!.className).toContain('border-white');
  });
});
