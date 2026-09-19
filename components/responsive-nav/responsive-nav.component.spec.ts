import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ResponsiveNavComponent } from './responsive-nav.component';
import { ResponsiveNavItemComponent } from './responsive-nav-item.component';

@Component({
  selector: 'ply-responsive-nav-host',
  imports: [ResponsiveNavComponent, ResponsiveNavItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ply-responsive-nav>
      <ply-responsive-nav-item routerLink="/">Home</ply-responsive-nav-item>
      <ply-responsive-nav-item routerLink="/docs">Docs</ply-responsive-nav-item>
      <ply-responsive-nav-item routerLink="/blog">Blog</ply-responsive-nav-item>
    </ply-responsive-nav>
  `,
})
class ResponsiveNavHostComponent {}

describe('ResponsiveNavComponent', () => {
  let fixture: ComponentFixture<ResponsiveNavHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ResponsiveNavHostComponent],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(ResponsiveNavHostComponent);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render projected items when space allows', () => {
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Home');
    expect(text).toContain('Docs');
    expect(text).toContain('Blog');
  });
});
