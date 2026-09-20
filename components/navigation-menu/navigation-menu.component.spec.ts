import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationMenuComponent } from './navigation-menu.component';
import { NavigationMenuLinkDirective } from './navigation-menu-link.directive';
import { NavigationMenuItemComponent } from './navigation-menu-item.component';

@Component({
  template: `
    <ply-navigation-menu ariaLabel="Product">
      <a ply-navigation-menu-link href="/">Home</a>
      <ply-navigation-menu-item label="More">
        <a href="/pro">Pro</a>
      </ply-navigation-menu-item>
    </ply-navigation-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavigationMenuComponent, NavigationMenuLinkDirective, NavigationMenuItemComponent],
})
class NavHostComponent {}

describe('NavigationMenuComponent a11y', () => {
  let fixture: ComponentFixture<NavHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NavHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(NavHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('exposes a labelled navigation landmark and opens a panel', () => {
    const nav = fixture.nativeElement.querySelector('[role="navigation"]') as HTMLElement;
    expect(nav.getAttribute('aria-label')).toBe('Product');

    const trigger = fixture.nativeElement.querySelector('[aria-haspopup]') as HTMLButtonElement;
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelector('.cdk-overlay-pane')).toBeTruthy();
  });
});
