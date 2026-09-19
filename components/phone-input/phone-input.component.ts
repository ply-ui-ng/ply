import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  signal,
  ElementRef,
  viewChild,
  OnDestroy,
  HostListener, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const COMMON_COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' }];

/**
 * A phone number input component with a country selector.
 */
@Component({
  selector: 'ply-phone-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ],
  templateUrl: './phone-input.component.html'
})
export class PhoneInputComponent implements ControlValueAccessor, OnDestroy {
  /** Prerendering destroys the app after render; there is nothing to unbind on the server. */
  private readonly isSsrSafeBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  countries = COMMON_COUNTRIES;
  
  selectedCountry = signal<Country>(this.countries[0]);
  phoneNumber = signal<string>('');
  dropdownOpen = signal<boolean>(false);
  isDisabled = signal<boolean>(false);

  readonly buttonSlot = viewChild<ElementRef<HTMLButtonElement>>('buttonSlot');
  readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  panelStyle = signal<Record<string, string>>({
    position: 'fixed', visibility: 'hidden', pointerEvents: 'none',
    top: '0', left: '-9999px', zIndex: '10000',
    minWidth: '200px', width: '200px', maxHeight: '300px'
  });

  onChange: (value: string) => void = () => undefined;
  onTouched: () => void = () => undefined;

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: EventTarget | null) {
    if (!(target instanceof Node)) return;
    const isButtonClick = this.buttonSlot()?.nativeElement?.contains(target);
    const isPanelClick = this.panel()?.nativeElement?.contains(target);
    
    if (this.dropdownOpen() && !isButtonClick && !isPanelClick) {
      this.closeDropdown();
    }
  }

  toggleDropdown() {
    this.dropdownOpen() ? this.closeDropdown() : this.openDropdown();
  }

  private openDropdownTimeout?: number;

  private openDropdown() {
    if (this.isDisabled()) return;
    this.dropdownOpen.set(true);
    window.clearTimeout(this.openDropdownTimeout);
    this.openDropdownTimeout = window.setTimeout(() => {
      if (!this.dropdownOpen()) return;
      this.calcPosition();
      window.addEventListener('scroll', this.reposition, true);
      window.addEventListener('resize', this.reposition);
    });
  }

  private closeDropdown() {
    window.clearTimeout(this.openDropdownTimeout);
    this.dropdownOpen.set(false);
    this.panelStyle.set({
      position: 'fixed', visibility: 'hidden', pointerEvents: 'none',
      top: '0', left: '-9999px', zIndex: '10000',
      minWidth: '200px', width: '200px', maxHeight: '300px'
    });
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
  }

  private reposition = () => { if (this.dropdownOpen()) this.calcPosition(); };

  private calcPosition() {
    const btn = this.buttonSlot()?.nativeElement;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const vh = window.innerHeight;
    
    const panelH = 300; 
    
    const style: Record<string, string> = {
      position: 'fixed', visibility: 'visible', pointerEvents: 'auto',
      zIndex: '10000',
      minWidth: '200px',
      width: '200px',
      maxHeight: '300px',
      left: `${rect.left}px`
    };

    const spaceBelow = vh - rect.bottom;
    if (spaceBelow < panelH && rect.top > spaceBelow) {
      style['bottom'] = `${vh - rect.top + 4}px`;
      style['top'] = 'auto';
    } else {
      style['top'] = `${rect.bottom + 4}px`;
      style['bottom'] = 'auto';
    }

    this.panelStyle.set(style);
  }

  selectCountry(country: Country) {
    this.selectedCountry.set(country);
    this.closeDropdown();
    this.emitValue();
  }

  ngOnDestroy() {
    if (!this.isSsrSafeBrowser) return;
    window.clearTimeout(this.openDropdownTimeout);
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
  }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    // Allow only numbers, spaces, and hyphens in the local part
    const sanitized = val.replace(/[^\d\s-]/g, '');
    (event.target as HTMLInputElement).value = sanitized;
    
    this.phoneNumber.set(sanitized);
    this.emitValue();
  }

  private emitValue() {
    const rawNumber = this.phoneNumber().replace(/[\s-]/g, '');
    if (!rawNumber) {
      this.onChange('');
    } else {
      this.onChange(`${this.selectedCountry().dialCode}${rawNumber}`);
    }
  }

  writeValue(val: string): void {
    if (!val) {
      this.phoneNumber.set('');
      return;
    }

    // Very basic parsing to find the dial code from the value
    let matchedCountry = this.countries[0]; // default US
    
    // Sort by dialCode length descending to match longest first (e.g. +44 vs +4)
    const sortedCountries = [...this.countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
    
    for (const country of sortedCountries) {
      if (val.startsWith(country.dialCode)) {
        matchedCountry = country;
        val = val.substring(country.dialCode.length);
        break;
      }
    }

    this.selectedCountry.set(matchedCountry);
    this.phoneNumber.set(val);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
