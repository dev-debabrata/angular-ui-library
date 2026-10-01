import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'nex-skeleton',
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
  host: {
    class: 'skeleton',
    'aria-hidden': 'true',
    '[class]': "'skeleton--' + shape() + ' skeleton--' + animation()",
    '[style.width]': 'size() || width()',
    '[style.height]': 'size() || height()',
    '[style.border-radius]': 'radius()',
  },
})
export class SkeletonComponent {
  /** Rectangle (rounded block) or circle */
  readonly shape = input<'rectangle' | 'circle'>('rectangle');
  /** Any CSS width, e.g. '100%' or '120px' */
  readonly width = input('100%');
  /** Any CSS height, e.g. '1rem' */
  readonly height = input('1rem');
  /** Sets both width and height. Handy for circles and squares */
  readonly size = input('');
  /** Custom CSS border radius. Overrides the shape's default */
  readonly borderRadius = input('');
  /** Loading effect: moving shimmer, fading pulse, or static */
  readonly animation = input<'wave' | 'pulse' | 'none'>('wave');

  protected readonly radius = computed(
    () => this.borderRadius() || (this.shape() === 'circle' ? '50%' : null),
  );
}
