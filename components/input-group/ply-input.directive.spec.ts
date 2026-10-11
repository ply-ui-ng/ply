import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseInputDirective } from './ply-input.directive';
import { BaseTextareaDirective } from './ply-textarea.directive';
import { BaseAddonStartDirective } from './ply-addon-start.directive';
import { BaseAddonEndDirective } from './ply-addon-end.directive';

@Component({
  imports: [
    BaseInputDirective,
    BaseTextareaDirective,
    BaseAddonStartDirective,
    BaseAddonEndDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label for="name">Name</label>
    <input id="name" ply-input class="uppercase" />
    <label for="note">Note</label>
    <textarea id="note" ply-textarea class="uppercase"></textarea>
    <span id="start" ply-addon-start>https://</span>
    <span id="end" ply-addon-end>.com</span>
  `,
})
class InputHostComponent {}

describe('input directives', () => {
  let fixture: ComponentFixture<InputHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InputHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(InputHostComponent);
    fixture.detectChanges();
  });

  function className(id: string): string {
    return (fixture.nativeElement.querySelector(`#${id}`) as HTMLElement).className;
  }

  it('applies field height and merges consumer classes', () => {
    expect(className('name')).toContain('h-9');
    expect(className('name')).toContain('uppercase');
    expect(className('note')).toContain('min-h-14');
    expect(className('note')).toContain('uppercase');
  });

  it('offsets addon start and end', () => {
    expect(className('start')).toContain('ms-4');
    expect(className('end')).toContain('me-4');
  });
});
