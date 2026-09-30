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

import { IconComponent } from '../icon/icon.component';

/** Ring circumference for r = 26 */
const RING = 2 * Math.PI * 26;

/** Floating "back to top" button: appears after scrolling down, shows scroll progress, scrolls smoothly up */
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
  /** Scrolling element to watch. Leave empty for the page; set it to place the button inside that element */
  readonly target = input<HTMLElement | null>(null);

  /** Pixels to scroll before the button appears */
  readonly threshold = input(400, { transform: numberAttribute });

  /** Corner to sit in */
  readonly position = input<'right' | 'left'>('right');

  /** Show a ring that fills as the page scrolls */
  readonly progress = input(true, { transform: booleanAttribute });

  /** Icon file name */
  readonly icon = input('chevron-up');

  /** Accessible name */
  readonly ariaLabel = input('Back to top');

  protected readonly scrolled = signal(0);
  private readonly max = signal(1);

  protected readonly visible = computed(() => this.scrolled() > this.threshold());
  protected readonly ring = RING;
  /** Stroke offset: full ring hidden at the top, fully drawn at the bottom */
  protected readonly offset = computed(
    () => RING * (1 - Math.min(1, this.scrolled() / this.max())),
  );

  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    effect((onCleanup) => {
      if (!this.browser) return; // Server render: no scrolling, the button starts hidden
      // The page scrolls documentElement but fires scroll events on window
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
