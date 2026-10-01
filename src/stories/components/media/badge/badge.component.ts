import { Component, booleanAttribute, input } from '@angular/core';

import type { Tone } from '../../../utils/types';

@Component({
  selector: 'nex-badge',
  templateUrl: './badge.html',
  styleUrl: './badge.css',
})
export class BadgeComponent {
  /** Badge text */
  readonly label = input('Badge');

  /** Color tone of the badge */
  readonly variant = input<Tone>('info');

  /** Fully rounded corners? */
  readonly pill = input(false, { transform: booleanAttribute });
}
