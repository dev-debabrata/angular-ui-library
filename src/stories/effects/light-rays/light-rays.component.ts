import { Component, computed, input, numberAttribute } from '@angular/core';

/**
 * Soft beams of light that fan down from the top and sway, behind the content. Pure CSS (blurred gradient bars),
 * so it renders on the server; reduced motion keeps them still.
 */
@Component({
  selector: 'np-light-rays',
  templateUrl: './light-rays.html',
  styleUrl: './light-rays.css',
  host: {
    class: 'np-effect',
    '[style.--rays-color]': 'color() || null',
    '[style.--rays-duration.s]': 'duration()',
  },
})
export class LightRaysComponent {
  /** Number of rays */
  readonly rays = input(7, { transform: numberAttribute });

  /** Ray color (any CSS color). Empty uses a soft version of the primary color */
  readonly color = input('');

  /** How wide the rays fan out, in degrees */
  readonly spread = input(70, { transform: numberAttribute });

  /** Seconds for one sway (lower is faster) */
  readonly duration = input(8, { transform: numberAttribute });

  /** Each ray's angle, width and timing, spread evenly with a little variation */
  protected readonly rayList = computed(() => {
    const n = Math.max(1, this.rays());
    return Array.from({ length: n }, (_, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      return {
        i,
        angle: (t - 0.5) * this.spread(),
        width: 60 + ((i * 37) % 70),
        delay: -((i * 1.7) % this.duration()),
        opacity: 0.45 + ((i * 29) % 40) / 100,
      };
    });
  });
}
