import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BreadcrumbComponent } from './breadcrumb.component';
import { BreadcrumbItemComponent } from './breadcrumb-item/breadcrumb-item.component';

/**
 * The TestHostComponent component.
 * @example <undefined></undefined>
 */
@Component({
  template: `
    <ply-breadcrumb>
      <ply-breadcrumb-item link="/">Home</ply-breadcrumb-item>
      <ply-breadcrumb-item link="/products">Products</ply-breadcrumb-item>
    </ply-breadcrumb>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BreadcrumbComponent, BreadcrumbItemComponent],
})
class TestHostComponent {}

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render content', () => {
    expect(fixture.nativeElement.querySelector('ply-breadcrumb')).toBeTruthy();
  });
});
