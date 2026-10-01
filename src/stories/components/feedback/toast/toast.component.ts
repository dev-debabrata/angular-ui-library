import { Component, effect, input, model, numberAttribute } from '@angular/core';

import { TONE_ICONS, type Tone } from '../../../utils/types';

@Component({
  selector: 'nex-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastComponent {
  /** Is the toast visible? Supports [(open)] two-way binding */
  readonly open = model(false);

  /** Toast text */
  readonly message = input('');

  /** Color tone of the toast */
  readonly type = input<Tone>('info');

  /** Corner of the screen where the toast appears */
  readonly position = input<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>('top-right');

  /** Milliseconds before the toast hides itself. 0 keeps it open */
  readonly duration = input(3000, { transform: numberAttribute });

  protected readonly icons = TONE_ICONS;

  constructor() {
    effect((onCleanup) => {
      if (this.open() && this.duration()) {
        const timer = setTimeout(() => this.open.set(false), this.duration());
        onCleanup(() => clearTimeout(timer));
      }
    });
  }
}
