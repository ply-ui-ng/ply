import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { lightboxInitialsFromAlt } from './lightbox-initials';
import { LightboxComponent } from './lightbox.component';
import { LightboxThumbDirective } from './lightbox-thumb.directive';

@Component({
  standalone: true,
  imports: [LightboxComponent, LightboxThumbDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ply-lightbox class="grid grid-cols-2 gap-2">
      <img ply-lightbox-thumb src="https://example.com/a.jpg" alt="A" class="aspect-square w-24" />
      <img ply-lightbox-thumb src="https://example.com/b.jpg" alt="B" class="aspect-square w-24" />
    </ply-lightbox>
  `,
})
class MultiHostComponent {}

@Component({
  standalone: true,
  imports: [LightboxComponent, LightboxThumbDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ply-lightbox>
      <img ply-lightbox-thumb src="https://example.com/solo.jpg" alt="Solo" class="aspect-video w-64" />
    </ply-lightbox>
  `,
})
class SingleHostComponent {}

@Component({
  standalone: true,
  imports: [LightboxComponent, LightboxThumbDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ply-lightbox>
      <img
        ply-lightbox-thumb
        src="https://example.invalid/missing.jpg"
        alt="Jane Doe"
        class="aspect-square h-20 w-20" />
    </ply-lightbox>
  `,
})
class BrokenHostComponent {}

describe('LightboxComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiHostComponent, SingleHostComponent, BrokenHostComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('should create with multiple thumbs', () => {
    const fixture = TestBed.createComponent(MultiHostComponent);
    fixture.detectChanges();
    const lightbox = fixture.debugElement.children[0].componentInstance as LightboxComponent;
    expect(lightbox).toBeTruthy();
    expect(lightbox.thumbs().length).toBe(2);
  });

  it('should open on thumb click and show the active image', () => {
    const fixture = TestBed.createComponent(MultiHostComponent);
    fixture.detectChanges();
    const lightbox = fixture.debugElement.children[0].componentInstance as LightboxComponent;
    const img = fixture.nativeElement.querySelector('[ply-lightbox-thumb]') as HTMLImageElement;
    img.click();
    fixture.detectChanges();

    expect(lightbox.isOpen()).toBe(true);
    expect(lightbox.activeIndex()).toBe(0);
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[role="dialog"] img')?.getAttribute('src')).toContain('a.jpg');
  });

  it('should navigate next/prev and reset transforms', () => {
    const fixture = TestBed.createComponent(MultiHostComponent);
    fixture.detectChanges();
    const lightbox = fixture.debugElement.children[0].componentInstance as LightboxComponent;
    lightbox.open(0);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[aria-label="Rotate 90 degrees"]') as HTMLButtonElement).click();
    (fixture.nativeElement.querySelector('[aria-label="Flip horizontal"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(lightbox.rotation()).toBe(90);
    expect(lightbox.flipX()).toBe(true);

    lightbox.next();
    expect(lightbox.activeIndex()).toBe(1);
    expect(lightbox.rotation()).toBe(0);
    expect(lightbox.flipX()).toBe(false);

    lightbox.prev();
    expect(lightbox.activeIndex()).toBe(0);
  });

  it('should open a single thumb without prev/next controls', () => {
    const fixture = TestBed.createComponent(SingleHostComponent);
    fixture.detectChanges();
    const lightbox = fixture.debugElement.children[0].componentInstance as LightboxComponent;
    lightbox.open();
    fixture.detectChanges();

    expect(lightbox.isOpen()).toBe(true);
    expect(lightbox.thumbs().length).toBe(1);
    expect(fixture.nativeElement.querySelector('[aria-label="Previous image"]')).toBeNull();
  });

  it('should close on Escape', () => {
    const fixture = TestBed.createComponent(SingleHostComponent);
    fixture.detectChanges();
    const lightbox = fixture.debugElement.children[0].componentInstance as LightboxComponent;
    lightbox.open();
    fixture.detectChanges();

    lightbox.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(lightbox.isOpen()).toBe(false);
  });

  it('should derive initials from alt text', () => {
    expect(lightboxInitialsFromAlt('Jane Doe')).toBe('JD');
    expect(lightboxInitialsFromAlt('Coast')).toBe('CO');
    expect(lightboxInitialsFromAlt('')).toBe('?');
  });

  it('should show initials placeholder when a thumb image errors', () => {
    const fixture = TestBed.createComponent(BrokenHostComponent);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    const placeholder = Array.from(
      fixture.nativeElement.querySelectorAll('[role="button"]') as NodeListOf<HTMLElement>,
    ).find((el) => el.tagName === 'DIV' && el.textContent?.trim() === 'JD');
    expect(placeholder).toBeTruthy();
  });
});
