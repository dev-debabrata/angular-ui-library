import { Component, input } from '@angular/core';

import type { Size } from '../../types';

@Component({
  selector: 'nex-spinner',
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
})
export class SpinnerComponent {
  /** How large should the spinner be? */
  readonly size = input<Size>('medium');

  /** Text shown next to the spinner */
  readonly label = input('');
}
