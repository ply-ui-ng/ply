import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';
import { provideBaseUI } from '../config/config';

describe('IconComponent', () => {
  let component: IconComponent;
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [IconComponent] });
    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply inline-flex to host', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.className).toContain('inline-flex');
  });

  it('should return null sizeWithUnit when size is empty', () => {
    fixture.componentRef.setInput('size', '');
    expect(component.sizeWithUnit()).toBeNull();
  });

  it('should convert numeric size to px string', () => {
    fixture.componentRef.setInput('size', 32);
    expect(component.sizeWithUnit()).toBe('32px');
  });

  it('should convert string numeric size to px string', () => {
    fixture.componentRef.setInput('size', '24');
    expect(component.sizeWithUnit()).toBe('24px');
  });

  it('should pass through non-numeric size as-is', () => {
    fixture.componentRef.setInput('size', '2rem');
    expect(component.sizeWithUnit()).toBe('2rem');
  });

  it('should merge consumer classes via cn()', () => {
    fixture.componentRef.setInput('class', 'text-blue-500');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.className).toContain('text-blue-500');
    expect(el.className).toContain('inline-flex');
    expect(el.className).not.toContain('stroke-current');
  });

  it('should default to w-6 h-6 and stroke-current', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.className).toContain('w-6');
    expect(el.className).toContain('h-6');
    expect(el.className).toContain('stroke-current');
  });

  it('should not add w-6 when the consumer already set a width class', () => {
    fixture.componentRef.setInput('class', 'w-8');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.className).toContain('w-8');
    expect(el.className.split(/\s+/)).not.toContain('w-6');
  });

  it('uses the default sprite path when path is omitted', () => {
    fixture.componentRef.setInput('name', 'home');
    fixture.detectChanges();
    const use = fixture.nativeElement.querySelector('use') as SVGUseElement;
    expect(use.getAttribute('href')).toBe('assets/icons.svg#home');
  });
});

describe('IconComponent provideBaseUI', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('uses provideBaseUI sprite paths when path is omitted', () => {
    TestBed.configureTestingModule({
      imports: [IconComponent],
      providers: [provideBaseUI({ iconPath: 'cdn/icons.svg', filledIconPath: 'cdn/filled.svg' })],
    });
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'home');
    fixture.detectChanges();
    const use = fixture.nativeElement.querySelector('use') as SVGUseElement;
    expect(use.getAttribute('href')).toBe('cdn/icons.svg#home');

    fixture.componentRef.setInput('filled', true);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector('use') as SVGUseElement).getAttribute('href'),
    ).toBe('cdn/filled.svg#home');
  });

  it('lets [path] override provideBaseUI', () => {
    TestBed.configureTestingModule({
      imports: [IconComponent],
      providers: [provideBaseUI({ iconPath: 'cdn/icons.svg' })],
    });
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'star');
    fixture.componentRef.setInput('path', 'local/sprite.svg');
    fixture.detectChanges();
    const use = fixture.nativeElement.querySelector('use') as SVGUseElement;
    expect(use.getAttribute('href')).toBe('local/sprite.svg#star');
  });

  it('applies defaultSize when size and size classes are omitted', () => {
    TestBed.configureTestingModule({
      imports: [IconComponent],
      providers: [provideBaseUI({ defaultSize: 20 })],
    });
    const fixture = TestBed.createComponent(IconComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.sizeWithUnit()).toBe('20px');
    expect(fixture.nativeElement.style.width).toBe('20px');
  });

  it('does not apply defaultSize when the host already has a width class', () => {
    TestBed.configureTestingModule({
      imports: [IconComponent],
      providers: [provideBaseUI({ defaultSize: 32 })],
    });
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('class', 'w-4 h-4');
    fixture.detectChanges();
    expect(fixture.componentInstance.sizeWithUnit()).toBeNull();
    expect(fixture.nativeElement.className).toContain('w-4');
  });
});
