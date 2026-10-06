import { Component, input, numberAttribute } from '@angular/core';

/**
 * A beam of light that travels around the element's border. Wrap a card (or give the host a border radius); the
 * beam follows the host's rounded corners. Pure CSS, so it renders on the server; reduced motion stops it.
 */
@Component({
  selector: 'np-border-beam',
  templateUrl: './border-beam.html',
  styleUrl: './border-beam.css',
  host: {
    '[style.--beam-size.px]': 'size()',
    '[style.--beam-duration.s]': 'duration()',
    '[style.--beam-delay.s]': '-delay()',
    '[style.--beam-width.px]': 'borderWidth()',
    '[style.--beam-from]': 'colorFrom() || null',
    '[style.--beam-to]': 'colorTo() || null',
  },
})
export class BorderBeamComponent {
  /** Length of the beam in px */
  readonly size = input(200, { transform: numberAttribute });

  /** Seconds for one trip around the border */
  readonly duration = input(6, { transform: numberAttribute });

  /** Start the beam this many seconds into its trip (to offset several beams) */
  readonly delay = input(0, { transform: numberAttribute });

  /** Width of the border the beam runs in, in px */
  readonly borderWidth = input(1.5, { transform: numberAttribute });

  /** Color at the head of the beam. Empty uses the accent color */
  readonly colorFrom = input('');

  /** Color at the tail of the beam. Empty uses the primary color */
  readonly colorTo = input('');
}
