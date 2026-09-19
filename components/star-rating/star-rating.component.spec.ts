import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { StarRatingComponent } from './star-rating.component';
import { StarComponent } from './star/star.component';

/**
 * The TestHostComponent component.
 * @example <undefined></undefined>
 */
@Component({
  template: `
    <ply-star-rating>
      <ply-star></ply-star>
      <ply-star></ply-star>
    </ply-star-rating>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StarRatingComponent, StarComponent],
})
class TestHostComponent {}

describe('StarRatingComponent', () => {
  let component: StarRatingComponent;
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
    expect(fixture.nativeElement.querySelector('ply-star-rating')).toBeTruthy();
  });
});
