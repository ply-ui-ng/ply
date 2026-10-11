import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseButtonDirective } from './ply-button.directive';
import { StrokedButtonDirective } from './ply-stroked-button.directive';
import { IconButtonDirective } from './ply-icon-button.directive';
import { BaseLinkDirective } from './ply-link.directive';

@Component({
  imports: [BaseButtonDirective, StrokedButtonDirective, IconButtonDirective, BaseLinkDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button id="primary" ply-button color="primary" size="md" class="rounded-full">Save</button>
    <button id="large" ply-button size="lg">Large</button>
    <button id="stroked" ply-stroked-button color="primary" size="md">Outline</button>
    <button id="icon" ply-icon-button color="primary" size="md" class="rounded-full" aria-label="Add"></button>
    <a id="link" ply-link color="primary" size="lg" href="#more">Read more</a>
  `,
})
class ButtonHostComponent {}

describe('button directives', () => {
  let fixture: ComponentFixture<ButtonHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ButtonHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(ButtonHostComponent);
    fixture.detectChanges();
  });

  function className(id: string): string {
    return (fixture.nativeElement.querySelector(`#${id}`) as HTMLElement).className;
  }

  it('maps md and lg to different heights and uses the primary token', () => {
    expect(className('primary')).toContain('h-9');
    expect(className('primary')).toContain('bg-[var(--ply-primary)]');
    expect(className('primary')).toContain('rounded-full');
    expect(className('large')).toContain('h-10');
    expect(className('large')).not.toContain('h-9');
  });

  it('styles stroked, icon, and link variants', () => {
    expect(className('stroked')).toContain('border-[var(--ply-primary)]');
    expect(className('stroked')).toContain('h-9');
    expect(className('icon')).toContain('h-8');
    expect(className('icon')).toContain('bg-[var(--ply-primary)]');
    expect(className('icon')).toContain('rounded-full');
    expect(className('link')).toContain('text-blue-500');
    expect(className('link')).toContain('text-base');
  });
});
