import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DividerComponent } from './divider.component';

describe('DividerComponent', () => {
  let component: DividerComponent;
  let fixture: ComponentFixture<DividerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DividerComponent],
    });
    fixture = TestBed.createComponent(DividerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render horizontal by default', () => {
    fixture.detectChanges();
    expect(component.vertical()).toBe(false);
  });

  it('should render vertical when set', () => {
    fixture.componentRef.setInput('vertical', true);
    fixture.detectChanges();
    expect(component.vertical()).toBe(true);
  });
});
