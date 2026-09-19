import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonGroupComponent } from './button-group.component';
import { GroupButtonComponent } from './group-button/group-button.component';

/**
 * The TestHostComponent component.
 * @example <undefined></undefined>
 */
@Component({
  template: `
    <ply-button-group [(ngModel)]="value">
      <ply-group-button-item value="list" icon="list"></ply-group-button-item>
      <ply-group-button-item value="grid" icon="grid"></ply-group-button-item>
    </ply-button-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonGroupComponent, GroupButtonComponent, FormsModule],
})
class TestHostComponent {
  value: string | undefined;
}

describe('ButtonGroupComponent', () => {
  let component: ButtonGroupComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select button when clicked via ToggleButtonService', () => {
    const buttons = component.buttons();
    buttons[1].toggle();
    expect(buttons[1].active()).toBe(true);
    expect(buttons[0].active()).toBe(false);
  });

  it('should emit valueChange when selection changes', () => {
    vi.spyOn(component.valueChange, 'emit');
    const buttons = component.buttons();
    buttons[1].toggle();
    expect(component.valueChange.emit).toHaveBeenCalledWith('grid');
  });
});
