import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * A caption overlay for a gallery slider or carousel item, typically positioned over the image.
 *
 * @example
 * <ply-carousel-caption>
 *   <h3>Slide Title</h3>
 *   <p>Slide description</p>
 * </ply-carousel-caption>
 */
@Component({
  selector: 'ply-carousel-caption',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  host: {
    class:
      'absolute inset-x-0 bottom-12 z-20 px-[15%] pt-4 pb-2 text-center pointer-events-none [&_h5]:opacity-0 [&_p]:opacity-0 in-[.active]:[&_h5]:animate-fadeInDown in-[.active]:[&_p]:animate-fadeInUp',
  },
})
export class CarouselCaptionComponent {}
