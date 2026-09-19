import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { AccordionComponent } from './accordion.component';
import { AccordionItemComponent } from './accordion-item/accordion-item.component';

@Component({
  imports: [AccordionComponent, AccordionItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ply-accordion [multi]="multi()">
      <ply-accordion-item></ply-accordion-item>
      <ply-accordion-item></ply-accordion-item>
    </ply-accordion>
  `,
})
class TestHostComponent {
  multi = signal(false);
}

describe('AccordionComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestHostComponent] });
    hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
  });

  it('should create', () => {
    expect(hostFixture.componentInstance).toBeTruthy();
  });

  it('should close other items when one is opened (single mode)', () => {
    const accordion = hostFixture.debugElement.query(
      (de) => de.componentInstance instanceof AccordionComponent
    )?.componentInstance as AccordionComponent;

    const [item1, item2] = accordion.items();
    item1.toggle();
    hostFixture.detectChanges();
    expect(item1.isOpen()).toBe(true);
    expect(item2.isOpen()).toBe(false);

    item2.toggle();
    hostFixture.detectChanges();
    expect(item2.isOpen()).toBe(true);
    expect(item1.isOpen()).toBe(false);
  });

  it('should allow multiple open items when multi=true', () => {
    hostFixture.componentInstance.multi.set(true);
    hostFixture.detectChanges();

    const accordion = hostFixture.debugElement.query(
      (de) => de.componentInstance instanceof AccordionComponent
    )?.componentInstance as AccordionComponent;

    const [item1, item2] = accordion.items();
    item1.toggle();
    item2.toggle();
    hostFixture.detectChanges();

    expect(item1.isOpen()).toBe(true);
    expect(item2.isOpen()).toBe(true);
  });
});
