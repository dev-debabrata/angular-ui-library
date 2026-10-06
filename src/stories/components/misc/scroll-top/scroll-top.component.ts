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
  untracked,
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { IconComponent } from '../../media/icon/icon.component';

/** Looks of the button */
export const SCROLL_TOP_VARIANTS = ['default', 'glass', 'outlined', 'soft', 'minimal'] as const;
export type ScrollTopVariant = (typeof SCROLL_TOP_VARIANTS)[number];

/** Ring circumference for r = 26 */
const RING = 2 * Math.PI * 26;

@Component({
  selector: 'np-scroll-top',
  imports: [IconComponent],
  templateUrl: './scroll-top.html',
  styleUrl: './scroll-top.css',
  host: {
    '[class.scroll-top--contained]': '!!target()',
    '[class.scroll-top--left]': "position() === 'left'",
  },
})
export class ScrollTopComponent {
  /** Scrolling element to watch and scroll; leave empty for the page */
  readonly target = input<HTMLElement | null>(null);
  /** Show the button after scrolling this many pixels */
  readonly threshold = input(400, { transform: numberAttribute });
  /** Corner of the button */
  readonly position = input<'right' | 'left'>('right');
  /** Show the scroll progress as a ring around the round button */
  readonly progress = input(true, { transform: booleanAttribute });
  /** Icon file name from src/stories/icons/svg */
  readonly icon = input('chevron-up');
  /** Accessible name of the button */
  readonly ariaLabel = input('Back to top');
  /** Look: default (gradient), glass (frosted), outlined, soft (tinted) or minimal */
  readonly variant = input<ScrollTopVariant>('default');
  /** Text after the icon, making the button a pill (e.g. "Top") */
  readonly label = input('');
  /** Show the scrolled percentage in place of the icon (the icon comes back on hover) */
  readonly percent = input(false, { transform: booleanAttribute });
  /** Show only while scrolling up, staying out of the way while reading down */
  readonly smart = input(false, { transform: booleanAttribute });

  protected readonly scrolled = signal(0);
  private readonly max = signal(1);
  private readonly up = signal(false);
  protected readonly visible = computed(
    () => this.scrolled() > this.threshold() && (!this.smart() || this.up()),
  );
  protected readonly ring = RING;
  protected readonly ratio = computed(() => Math.min(1, this.scrolled() / this.max()));

  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    effect((onCleanup) => {
      if (!this.browser) return;
      const el = this.target() ?? document.documentElement;
      const source = this.target() ?? window;
      const read = () => {
        this.up.set(el.scrollTop < untracked(this.scrolled));
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
