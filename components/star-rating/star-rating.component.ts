import { Component, input ,
  ChangeDetectionStrategy
} from '@angular/core';

/**
 * A flexbox container wrapper for `ply-star` components.
 * Aligns stars horizontally with appropriate gap spacing.
 * 
 * @example
 * <ply-star-rating ariaLabel="Product rating">
 *   <ply-star filled="true"></ply-star>
 *   <ply-star filled="false"></ply-star>
 * </ply-star-rating>
 */
@Component({
  selector: 'ply-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './star-rating.component.html',
  host: {
    role: 'group',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class StarRatingComponent {
  /** Accessible label for the star rating group. */
  readonly ariaLabel = input('Rating');
}
