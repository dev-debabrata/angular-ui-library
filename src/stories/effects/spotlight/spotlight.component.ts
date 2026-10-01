import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';

import { localPoint } from '../canvas-effect';

/**
 * A soft glow that follows the pointer behind the content, or with `dim` a flashlight that darkens everything
 * outside it. Pure CSS (a radial gradient positioned by custom properties), so it renders on the server.
 */
@Component({
  selector: 'nex-spotlight',
  templateUrl: './spotlight.html',
  styleUrl: './spotlight.css',
  host: {
    class: 'nex-effect',
    '[class.spotlight--on]': 'on()',
    '[class.spotlight--dim]': 'dim()',
    '[style.--spot-size.px]': 'size()',
    '[style.--spot-color]': 'color() || null',
  },
})
export class SpotlightComponent {
  /** Glow color (any CSS color). Empty uses a soft version of the primary color */
  readonly color = input('');

  /** Diameter of the light in px */
  readonly size = input(420, { transform: numberAttribute });

  /** Flashlight: darken everything outside the light */
  readonly dim = input(false, { transform: booleanAttribute });

  protected readonly on = signal(false);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const listeners = new AbortController();
    inject(DestroyRef).onDestroy(() => listeners.abort());
    // Plain listeners (not host bindings): pointer moves don't run change detection
    afterNextRender(() => {
      host.addEventListener(
        'pointermove',
        (e) => {
          const { x, y } = localPoint(host, e);
          host.style.setProperty('--spot-x', `${x}px`);
          host.style.setProperty('--spot-y', `${y}px`);
          this.on.set(true);
        },
        { signal: listeners.signal },
      );
      host.addEventListener('pointerleave', () => this.on.set(false), { signal: listeners.signal });
    });
  }
}
