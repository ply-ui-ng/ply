import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseHeadingDirective } from './ply-heading.directive';

@Component({
  template: `
    <p plyTypography="display">Display</p>
    <p plyTypography="body">Body</p>
    <h2 plyHeadingText>Section</h2>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseHeadingDirective],
})
class TypographyHostComponent {}

describe('BaseHeadingDirective scale', () => {
  let fixture: ComponentFixture<TypographyHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TypographyHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(TypographyHostComponent);
    fixture.detectChanges();
  });

  it('applies display, body, and heading steps', () => {
    const [display, body] = Array.from(fixture.nativeElement.querySelectorAll('p')) as HTMLElement[];
    const heading = fixture.nativeElement.querySelector('h2') as HTMLElement;
    expect(display.className).toContain('text-4xl');
    expect(body.className).toContain('text-base');
    expect(heading.className).toContain('text-2xl');
    expect(heading.className).toContain('font-semibold');
  });
});
