import { Component, input } from '@angular/core';

import type { Size } from '../../../utils/types';

@Component({
  selector: 'np-spinner',
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
})
export class SpinnerComponent {
  /** How large should the spinner be? */
  readonly size = input<Size>('medium');

  /** Text shown next to the spinner */
  readonly label = input('');
}
