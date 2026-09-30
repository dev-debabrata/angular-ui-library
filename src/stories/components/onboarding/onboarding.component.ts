import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export const ONBOARDING_MODES = ['spotlight', 'beacon', 'welcome'] as const;
export type OnboardingMode = (typeof ONBOARDING_MODES)[number];
export const ONBOARDING_THEMES = ['light', 'dark', 'gradient', 'glass'] as const;
export type OnboardingTheme = (typeof ONBOARDING_THEMES)[number];

export interface OnboardingStep {
  /** Element to highlight: a CSS selector or the element itself. Not used in 'welcome' mode */
  target?: string | Element;
  /** Welcome mode: icon file name shown large at the top */
  icon?: string;
  /** Welcome mode: image URL shown at the top (instead of the icon) */
  image?: string;
  /** Explanation shown in the tooltip */
  text: string;
  /** Optional heading above the text */
  title?: string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Onboarding tour with Back / Next / Skip. Modes:
 * - spotlight: dims the page and moves a spotlight from element to element
 * - beacon: a pulsing hotspot on each element, no dimming, the page stays usable
 * - welcome: centered slides with a big icon or image (an intro before the tour)
 * Call start() (e.g. from a "Restart" button) or set `autoStart` with a `storageKey` to show it once per browser.
 */
@Component({
  selector: 'nex-onboarding',
  imports: [IconComponent],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
  host: {
    '(window:resize)': 'measure()',
    '(window:scroll)': 'measure()',
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class OnboardingComponent {
  /** Steps in order */
  readonly steps = input<OnboardingStep[]>([]);

  /** How the tour is shown */
  readonly mode = input<OnboardingMode>('spotlight');

  /** Tooltip look */
  readonly theme = input<OnboardingTheme>('light');

  /** Whether the tour is showing. Supports [(open)] two-way binding */
  readonly open = model(false);

  /** Current step index. Supports [(step)] two-way binding */
  readonly step = model(0);

  /** Start the tour when the page loads (once per browser when `storageKey` is set) */
  readonly autoStart = input(false, { transform: booleanAttribute });

  /** localStorage key that remembers a finished or skipped tour, so it isn't shown again */
  readonly storageKey = input('');

  /** Space between the element and the spotlight edge, in pixels */
  readonly padding = input(8, { transform: numberAttribute });

  /** Show the Skip button */
  readonly showSkip = input(true, { transform: booleanAttribute });

  /** Text of the Next button */
  readonly nextLabel = input('Next');

  /** Text of the Next button on the last step */
  readonly doneLabel = input('Got it');

  /** Text of the Back button */
  readonly backLabel = input('Back');

  /** Text of the Skip button */
  readonly skipLabel = input('Skip tour');

  /** Emits when the user finishes the last step */
  readonly finished = output<void>();

  /** Emits when the user skips the tour; the value is the step they were on */
  readonly skipped = output<number>();

  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly tooltip = viewChild<ElementRef<HTMLElement>>('tooltip');

  /** Spotlight box around the current element (viewport coordinates) */
  protected readonly hole = signal<Rect | null>(null);
  /** Tooltip position: below the spotlight, or above it (translated up by its own height) when there's no room */
  protected readonly tip = signal({ top: 0, left: 0, above: false });

  protected readonly current = computed(() => this.steps()[this.step()]);
  protected readonly last = computed(() => this.step() >= this.steps().length - 1);

  constructor() {
    afterNextRender(() => {
      const key = this.storageKey();
      if (this.autoStart() && !(key && localStorage.getItem(key))) this.start();
    });

    // New step: bring its element into view, then place the spotlight and tooltip
    effect(() => {
      const step = this.current();
      if (!this.open() || !step || !this.browser) return;
      untracked(() => {
        const el = this.element(step);
        if (el) this.reveal(el);
        this.measure();
        // Measure again once smooth scrolling has settled, and move focus to Next for keyboard users
        setTimeout(() => this.measure(), 350);
        setTimeout(() =>
          this.tooltip()
            ?.nativeElement.querySelector<HTMLElement>('.onboarding__next')
            ?.focus({ preventScroll: true }),
        );
      });
    });
  }

  /** Start the tour, from the first step or the given one */
  start(step = 0) {
    this.step.set(step);
    this.open.set(true);
  }

  /** Close without finishing (same as Skip) */
  stop() {
    this.close();
    this.skipped.emit(this.step());
  }

  protected next() {
    if (!this.last()) return this.step.update((i) => i + 1);
    this.close();
    this.finished.emit();
  }

  protected back() {
    this.step.update((i) => Math.max(0, i - 1));
  }

  protected measure() {
    const step = this.current();
    const el = step && this.open() ? this.element(step) : null;
    if (!el) return this.hole.set(null);
    const r = el.getBoundingClientRect();
    const pad = this.padding();
    const hole = {
      top: r.top - pad,
      left: r.left - pad,
      width: r.width + 2 * pad,
      height: r.height + 2 * pad,
    };
    this.hole.set(hole);
    const bottom = hole.top + hole.height;
    const spaceBelow = innerHeight - bottom;
    const above = spaceBelow < 220 && hole.top > spaceBelow;
    const width = Math.min(320, innerWidth - 16);
    this.tip.set({
      top: above ? hole.top - 12 : bottom + 12,
      left: Math.max(8, Math.min(hole.left, innerWidth - width - 8)),
      above,
    });
  }

  protected onKeydown(event: KeyboardEvent) {
    if (!this.open()) return;
    const keys: Record<string, () => void> = {
      Escape: () => this.stop(),
      ArrowRight: () => this.next(),
      ArrowLeft: () => this.back(),
    };
    keys[event.key]?.();
  }

  private close() {
    this.open.set(false);
    const key = this.storageKey();
    if (key && this.browser) localStorage.setItem(key, 'done');
  }

  /**
   * Scroll the element to the middle of the window, only if it's off-screen. scrollIntoView() isn't used because it
   * also scrolls every parent frame (a tour inside an iframe would jump the host page)
   */
  private reveal(el: Element) {
    const r = el.getBoundingClientRect();
    if (r.top >= 0 && r.bottom <= innerHeight) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollBy({
      top: r.top + r.height / 2 - innerHeight / 2,
      behavior: reduced ? 'auto' : 'smooth',
    });
  }

  /** The step's element (none in welcome mode) */
  private element(step: OnboardingStep) {
    if (this.mode() === 'welcome') return null;
    return typeof step.target === 'string'
      ? document.querySelector(step.target)
      : (step.target ?? null);
  }
}
