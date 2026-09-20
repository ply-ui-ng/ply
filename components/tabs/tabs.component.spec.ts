import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TabsComponent } from './tabs.component';
import { TabComponent } from './tab/tab.component';
import { TabBodyComponent } from './tab-body/tab-body.component';

@Component({
  template: `
    <ply-tabs ariaLabel="Demo tabs">
      <ply-tab label="One"><ply-tab-body>First</ply-tab-body></ply-tab>
      <ply-tab label="Two"><ply-tab-body>Second</ply-tab-body></ply-tab>
      <ply-tab label="Three"><ply-tab-body>Third</ply-tab-body></ply-tab>
    </ply-tabs>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TabsComponent, TabComponent, TabBodyComponent],
})
class TabsHostComponent {}

describe('TabsComponent a11y', () => {
  let fixture: ComponentFixture<TabsHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsHostComponent);
    fixture.detectChanges();
  });

  it('renders tablist semantics with one selected tab and a tabpanel', () => {
    const tablist = fixture.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
    expect(tablist.getAttribute('aria-label')).toBe('Demo tabs');

    const tabs = Array.from(
      fixture.nativeElement.querySelectorAll('[role="tab"]')
    ) as HTMLButtonElement[];
    expect(tabs.length).toBe(3);
    expect(tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true').length).toBe(1);
    expect(fixture.nativeElement.querySelector('[role="tabpanel"]')).toBeTruthy();
  });

  it('uses --ply-ring for tab focus', () => {
    const tabs = fixture.debugElement.query(By.directive(TabsComponent))
      .componentInstance as TabsComponent;
    expect(tabs.getTabClass(tabs.tabs()[0])).toContain('--ply-ring');
  });

  it('supports arrow-key navigation between tabs', () => {
    const tablist = fixture.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
    const tabs = Array.from(
      fixture.nativeElement.querySelectorAll('[role="tab"]')
    ) as HTMLButtonElement[];

    tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
  });
});
