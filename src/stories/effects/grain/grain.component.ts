import { Component, booleanAttribute, input, numberAttribute } from '@angular/core';

/**
 * A film-grain texture over the content, for a tactile, printed look. Pure CSS (an SVG noise tile), so it renders
 * on the server; `animated` makes the grain flicker like film, which reduced motion turns off.
 */
@Component({
  selector: 'np-grain',
  templateUrl: './grain.html',
  styleUrl: './grain.css',
  host: {
    class: 'np-effect',
    '[class.grain--animated]': 'animated()',
    '[style.--grain-opacity]': 'opacity()',
  },
})
export class GrainComponent {
  /** Strength of the grain (0–1) */
  readonly opacity = input(0.12, { transform: numberAttribute });

  /** Flicker the grain like film */
  readonly animated = input(true, { transform: booleanAttribute });
}
