import { Component, booleanAttribute, computed, input, numberAttribute } from '@angular/core';

import type { Tone } from '../../../utils/types';

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

  protected readonly percent = computed(() => Math.round(Math.min(100, Math.max(0, this.value()))));
}
