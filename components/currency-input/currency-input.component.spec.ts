import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyInputComponent } from './currency-input.component';

describe('CurrencyInputComponent', () => {
  let fixture: ComponentFixture<CurrencyInputComponent>;
  let component: CurrencyInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencyInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formats a written numeric value when idle', () => {
    component.writeValue(1234.5);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toContain('1,234.50');
  });

  it('re-formats the idle display when locale or currency changes', () => {
    component.writeValue(1234.5);
    fixture.detectChanges();
    fixture.componentRef.setInput('locale', 'de-DE');
    fixture.componentRef.setInput('currency', 'EUR');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toMatch(/1\.234,50/);
  });

  it('parses locale decimal separators on input', () => {
    let emitted: number | null | undefined;
    component.registerOnChange((value) => {
      emitted = value;
    });
    fixture.componentRef.setInput('locale', 'de-DE');
    fixture.componentRef.setInput('currency', 'EUR');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '1,50';
    input.dispatchEvent(new Event('input'));
    expect(emitted).toBe(1.5);

    input.value = '1.234,56';
    input.dispatchEvent(new Event('input'));
    expect(emitted).toBe(1234.56);
  });

  it('does not treat an incomplete trailing group as thousands on each keystroke', () => {
    let emitted: number | null | undefined;
    component.registerOnChange((value) => {
      emitted = value;
    });
    fixture.componentRef.setInput('locale', 'de-DE');
    fixture.componentRef.setInput('currency', 'EUR');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '1.5';
    input.dispatchEvent(new Event('input'));
    expect(emitted).toBe(1.5);

    input.value = '1.50';
    input.dispatchEvent(new Event('input'));
    expect(emitted).toBe(1.5);

    input.value = '1.500';
    input.dispatchEvent(new Event('input'));
    expect(emitted).toBe(1500);
  });
});
