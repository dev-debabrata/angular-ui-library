import {
  Component,
  PLATFORM_ID,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { IconComponent } from '../../media/icon/icon.component';

/** Ring circumference for r = 26 */
const RING = 2 * Math.PI * 26;

@Component({
  selector: 'nex-scroll-top',
  imports: [IconComponent],
  templateUrl: './scroll-top.html',
  styleUrl: './scroll-top.css',
  host: {
    '[class.scroll-top--contained]': '!!target()',
    '[class.scroll-top--left]': "position() === 'left'",
  },
})
export class ScrollTopComponent {
  readonly target = input<HTMLElement | null>(null);
  readonly threshold = input(400, { transform: numberAttribute });
  readonly position = input<'right' | 'left'>('right');
  readonly progress = input(true, { transform: booleanAttribute });
  readonly icon = input('chevron-up');
  readonly ariaLabel = input('Back to top');

  protected readonly scrolled = signal(0);
  private readonly max = signal(1);
  protected readonly visible = computed(() => this.scrolled() > this.threshold());
  protected readonly ring = RING;
  protected readonly offset = computed(
    () => RING * (1 - Math.min(1, this.scrolled() / this.max())),
  );

  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    effect((onCleanup) => {
      if (!this.browser) return;
      const el = this.target() ?? document.documentElement;
      const source = this.target() ?? window;
      const read = () => {
        this.scrolled.set(el.scrollTop);
        this.max.set(Math.max(1, el.scrollHeight - el.clientHeight));
      };
      read();
      source.addEventListener('scroll', read, { passive: true });
      onCleanup(() => source.removeEventListener('scroll', read));
    });
  }

  protected scrollUp() {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    (this.target() ?? window).scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }
}
