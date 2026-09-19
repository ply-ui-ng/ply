import { InjectionToken } from '@angular/core';

/**
 * Injection token used internally by the gallery slider components
 * to share slider state between `GallerySliderComponent` and its child items.
 *
 * @example
 * // Used internally — injected in GallerySliderComponent and consumed by CarouselItemComponent.
 * constructor(@Inject(GALLERY_SLIDER_TOKEN) private slider: GallerySliderComponent) {}
 */
export interface GallerySliderApi {
  totalItems(): number;
  transition(): string;
}

export const GALLERY_SLIDER_TOKEN = new InjectionToken<GallerySliderApi>('GALLERY_SLIDER_TOKEN');
