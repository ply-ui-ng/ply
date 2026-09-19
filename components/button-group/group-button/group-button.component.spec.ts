import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupButtonComponent } from './group-button.component';
import { ToggleButtonService } from '../toggle-button.service';

describe('GroupButtonComponent', () => {
  let component: GroupButtonComponent;
  let fixture: ComponentFixture<GroupButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GroupButtonComponent],
      providers: [ToggleButtonService],
    });
    fixture = TestBed.createComponent(GroupButtonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set active state via signal', () => {
    component.active.set(true);
    fixture.detectChanges();
    expect(component.active()).toBe(true);
  });

  it('should not toggle when disabled', () => {
    const spy = vi.spyOn(component['toggleButtonService'], 'setSelectedButton');
    fixture.componentRef.setInput('disabled', true);
    component.toggle();
    expect(spy).not.toHaveBeenCalled();
  });
});
