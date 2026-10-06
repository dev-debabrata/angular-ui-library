import { Component, booleanAttribute, computed, input, numberAttribute } from '@angular/core';

import type { Size, Tone } from '../../../utils/types';

/** Looks of the progress bar */
export const PROGRESS_BAR_VARIANTS = [
  'default',
  'gradient',
  'striped',
  'glow',
  'segmented',
  'thin',
] as const;
export type ProgressBarVariant = (typeof PROGRESS_BAR_VARIANTS)[number];
/** Where the percentage is shown */
export const PROGRESS_LABEL_POSITIONS = ['end', 'inside', 'top'] as const;
export type ProgressLabelPosition = (typeof PROGRESS_LABEL_POSITIONS)[number];

@Component({
  selector: 'np-progress-bar',
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.css',
})
export class ProgressBarComponent {
  /** Progress from 0 to 100 */
  readonly value = input(0, { transform: numberAttribute });

  /** Color tone of the bar */
  readonly variant = input<Tone>('info');

  /** Show the percentage next to the bar? */
  readonly showLabel = input(true, { transform: booleanAttribute });
  /** Look: default, gradient (tone to accent along the track), striped (moving stripes), glow, segmented (steps) or thin */
  readonly look = input<ProgressBarVariant>('default');
  /** Bar thickness, or the ring's diameter when circular */
  readonly size = input<Size>('medium');
  /** Draw a ring with the percentage in its center instead of a bar (uses the tone, size, glow and thin looks) */
  readonly circular = input(false, { transform: booleanAttribute });
  /** Unknown progress: the bar (or arc) loops and the percentage is hidden */
  readonly indeterminate = input(false, { transform: booleanAttribute });
  /** Buffered amount from 0 to 100, a lighter fill behind the value (e.g. media loading) */
  readonly buffer = input(0, { transform: numberAttribute });
  /** Number of steps of the segmented look */
  readonly segments = input(10, { transform: numberAttribute });
  /** Where the percentage goes: end (after the bar), inside (on the fill) or top (above, right of the caption) */
  readonly labelPosition = input<ProgressLabelPosition>('end');
  /** Caption above the bar, also the accessible name (e.g. "Uploading") */
  readonly label = input('');

  protected readonly percent = computed(() => Math.round(Math.min(100, Math.max(0, this.value()))));
}
