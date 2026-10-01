import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  viewChild,
} from '@angular/core';

import { THEME_COLOR_VARS, localPoint } from '../canvas-effect';

/**
 * Soft, slowly moving blobs of color (an "aurora" or mesh-gradient background) behind the content. Pure CSS
 * animation, so it renders on the server; the blobs can drift towards the pointer. Still with reduced motion.
 */
@Component({
  selector: 'nex-aurora',
  templateUrl: './aurora.html',
  styleUrl: './aurora.css',
  host: {
    class: 'nex-effect',
    '[style.--aurora-duration.s]': '20 / (speed() || 1)',
    '[style.--aurora-blur.px]': 'blur()',
    '[style.--aurora-opacity]': 'opacity()',
  },
})
export class AuroraComponent {
  /** Blob colors (2–6 work best). Empty uses the theme's primary, accent and chart colors */
  readonly colors = input<string[]>([]);

  /** Animation speed (1 = one slow 20 s cycle) */
  readonly speed = input(1, { transform: numberAttribute });

  /** Blur in px: higher is softer */
  readonly blur = input(70, { transform: numberAttribute });

  /** Blob opacity, 0–1 */
  readonly opacity = input(0.75, { transform: numberAttribute });

  /** Drift the blobs towards the pointer */
  readonly followPointer = input(true, { transform: booleanAttribute });

  protected readonly blobs = computed(() =>
    (this.colors().length ? this.colors() : THEME_COLOR_VARS.map((v) => `var(${v})`)).slice(0, 6),
  );
  private readonly layer = viewChild.required<ElementRef<HTMLElement>>('layer');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const listeners = new AbortController();
    inject(DestroyRef).onDestroy(() => listeners.abort());
    // Plain listeners (not host bindings): pointer moves don't run change detection, and only the blob
    // layer's transform changes
    afterNextRender(() => {
      const layer = this.layer().nativeElement;
      host.addEventListener(
        'pointermove',
        (e) => {
          if (!this.followPointer()) return;
          const { x, y } = localPoint(host, e);
          const rect = host.getBoundingClientRect();
          layer.style.transform = `translate(${(x / rect.width - 0.5) * 80}px, ${(y / rect.height - 0.5) * 80}px)`;
        },
        { signal: listeners.signal },
      );
      host.addEventListener('pointerleave', () => (layer.style.transform = ''), {
        signal: listeners.signal,
      });
    });
  }
}
