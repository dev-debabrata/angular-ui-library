import { Component, input, numberAttribute } from '@angular/core';

/**
 * A synthwave-style perspective grid that scrolls towards the viewer, fading out at the horizon. Pure CSS, so
 * it renders on the server; reduced motion stops the scroll.
 */
@Component({
  selector: 'np-retro-grid',
  templateUrl: './retro-grid.html',
  styleUrl: './retro-grid.css',
  host: {
    class: 'np-effect',
    '[style.--rg-angle.deg]': 'angle()',
    '[style.--rg-cell.px]': 'cellSize()',
    '[style.--rg-duration.s]': 'duration()',
    '[style.--rg-color]': 'color() || null',
  },
})
export class RetroGridComponent {
  /** Tilt of the grid in degrees (higher is flatter) */
  readonly angle = input(65, { transform: numberAttribute });

  /** Size of one grid cell in px */
  readonly cellSize = input(60, { transform: numberAttribute });

  /** Line color (any CSS color). Empty uses a soft version of the primary color */
  readonly color = input('');

  /** Seconds for the grid to scroll one cycle (lower is faster) */
  readonly duration = input(15, { transform: numberAttribute });
}
