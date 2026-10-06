import { Component, computed, input, numberAttribute } from '@angular/core';

/** Looks of the skeleton */
export const SKELETON_VARIANTS = ['default', 'soft', 'gradient', 'glass'] as const;
export type SkeletonVariant = (typeof SKELETON_VARIANTS)[number];
/** Ready-made loading layouts */
export const SKELETON_PRESETS = ['text', 'avatar', 'list', 'card', 'table'] as const;
export type SkeletonPreset = (typeof SKELETON_PRESETS)[number];

@Component({
  selector: 'np-skeleton',
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
  host: {
    class: 'skeleton',
    'aria-hidden': 'true',
    '[class]':
      "'skeleton--' + shape() + ' skeleton--' + animation() + ' skeleton--' + variant() + (preset() ? ' skeleton--preset skeleton--' + preset() : '')",
    '[style.width]': 'size() || width()',
    '[style.height]': 'preset() ? null : size() || height()',
    '[style.border-radius]': 'radius()',
    '[style.--sk-duration]': 'duration() || null',
    '[style.--cols]': 'columns()',
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
  /** Look: default (neutral), soft (primary tint), gradient (primary to accent) or glass (frosted, for colored backgrounds) */
  readonly variant = input<SkeletonVariant>('default');
  /** Ready-made layout: text lines, avatar (circle + name), list, card or table. Empty for a single block */
  readonly preset = input<SkeletonPreset | ''>('');
  /** Text lines (text, card), list items (list) or body rows (table) of a preset */
  readonly lines = input(3, { transform: numberAttribute });
  /** Columns of the table preset */
  readonly columns = input(4, { transform: numberAttribute });
  /** Length of one animation cycle, e.g. '2s' (empty: 1.4s wave, 1.5s pulse) */
  readonly duration = input('');

  protected readonly radius = computed(
    () => this.borderRadius() || (this.shape() === 'circle' ? '50%' : null),
  );
  protected readonly range = (n: number) => Array.from({ length: n }, (_, i) => i);
}
