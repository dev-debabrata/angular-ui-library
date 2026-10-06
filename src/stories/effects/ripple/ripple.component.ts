import { Component, computed, input, numberAttribute } from '@angular/core';

/**
 * Concentric rings that pulse outward from the center, behind the content (a radar or "live" look). Pure CSS, so
 * it renders on the server; reduced motion keeps the rings still.
 */
@Component({
  selector: 'np-ripple',
  templateUrl: './ripple.html',
  styleUrl: './ripple.css',
  host: {
    class: 'np-effect',
    '[style.--ripple-size.px]': 'size()',
    '[style.--ripple-step.px]': 'spacing()',
    '[style.--ripple-color]': 'color() || null',
  },
})
export class RippleComponent {
  /** Number of rings */
  readonly rings = input(8, { transform: numberAttribute });

  /** Diameter of the innermost ring in px */
  readonly size = input(210, { transform: numberAttribute });

  /** Extra diameter of each next ring in px */
  readonly spacing = input(70, { transform: numberAttribute });

  /** Ring color (any CSS color). Empty uses the primary color */
  readonly color = input('');

  protected readonly ringList = computed(() =>
    Array.from({ length: Math.max(1, this.rings()) }, (_, i) => i),
  );
}
