import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';

/** Looks of the carousel */
export const CAROUSEL_VARIANTS = ['default', 'peek', 'coverflow', 'fade', 'glass'] as const;
export type CarouselVariant = (typeof CAROUSEL_VARIANTS)[number];

/** Styles of the page indicator */
export const CAROUSEL_INDICATORS = ['dots', 'bars', 'numbers', 'progress'] as const;
export type CarouselIndicator = (typeof CAROUSEL_INDICATORS)[number];

/**
 * Slides through items rendered with your template:
 * <np-carousel [items]="products"><ng-template let-item>…</ng-template></np-carousel>
 * Without a template, each child element is a slide (this is how React/Vue use the Web Component):
 * <np-carousel><div>1</div><div>2</div></np-carousel>
 */
@Component({
  selector: 'np-carousel',
  imports: [NgTemplateOutlet, IconComponent],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css',
  host: {
    '(mouseenter)': 'paused.set(true)',
    '(mouseleave)': 'paused.set(false)',
    '(focusin)': 'paused.set(true)',
    '(focusout)': 'paused.set(false)',
  },
})
export class CarouselComponent<T = unknown> {
  /** Items to show with the template. Not needed when the slides are child elements */
  readonly items = input<T[]>([]);

  /** Items visible at once */
  readonly numVisible = input(1, { transform: numberAttribute });

  /** Items moved per step */
  readonly numScroll = input(1, { transform: numberAttribute });

  /** Wrap from the last page to the first and back */
  readonly circular = input(false, { transform: booleanAttribute });

  /** Milliseconds between automatic steps (0 = off). Pauses while hovered or focused */
  readonly autoplayInterval = input(0, { transform: numberAttribute });

  /** Previous/next buttons */
  readonly showNavigators = input(true, { transform: booleanAttribute });

  /** Page dots below the items */
  readonly showIndicators = input(true, { transform: booleanAttribute });

  /** Look: default, peek (dimmed neighbors at the edges), coverflow (3D), fade (crossfade) or glass (frosted controls) */
  readonly variant = input<CarouselVariant>('default');

  /** Page indicator: dots, bars (fill during autoplay), numbers ("3 / 8") or progress (a filling line) */
  readonly indicator = input<CarouselIndicator>('dots');

  /** Slide up and down instead of sideways (needs `height`) */
  readonly vertical = input(false, { transform: booleanAttribute });

  /** Height of the slides area when `vertical` (any CSS length) */
  readonly height = input('320px');

  /** Gap between items (any CSS length) */
  readonly gap = input('16px');

  /** Accessible name of the carousel */
  readonly ariaLabel = input('Carousel');

  /** Current page. Supports [(page)] two-way binding */
  readonly page = model(0);

  protected readonly template =
    contentChild<TemplateRef<{ $implicit: T; index: number }>>(TemplateRef);
  protected readonly paused = signal(false);
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  /** Child-element slides (when there is no template) */
  private readonly slides = signal<HTMLElement[]>([]);

  /** Items visible at once (fade always shows one) */
  protected readonly visible = computed(() => (this.variant() === 'fade' ? 1 : this.numVisible()));

  /** Autoplay is running (not paused by hover or focus) */
  protected readonly playing = computed(
    () => this.autoplayInterval() > 0 && !this.paused() && this.pages() > 1,
  );

  /** Number of slides */
  protected readonly count = computed(() =>
    this.template() ? this.items().length : this.slides().length,
  );

  protected readonly pages = computed(() =>
    Math.max(1, Math.ceil((this.count() - this.visible()) / this.numScroll()) + 1),
  );

  protected readonly pageList = computed(() => Array.from({ length: this.pages() }, (_, i) => i));

  /** Index of the first visible item; the last page is aligned to the end */
  protected readonly first = computed(() =>
    Math.max(0, Math.min(this.page() * this.numScroll(), this.count() - this.visible())),
  );

  /** Middle visible slide; each slide's `--offset` is its distance to it (coverflow) */
  protected readonly center = computed(() => this.first() + Math.floor((this.visible() - 1) / 2));

  protected readonly canPrev = computed(() => this.circular() || this.page() > 0);
  protected readonly canNext = computed(() => this.circular() || this.page() < this.pages() - 1);

  /** Pointer position (x, or y when vertical) where a swipe started */
  private swipeStart: number | null = null;

  constructor() {
    // Keep the page valid when items or sizes change
    effect(() => this.page() >= this.pages() && this.page.set(this.pages() - 1));

    // One timeout per page, so any page change (or resuming) restarts the countdown and the bars indicator
    effect((onCleanup) => {
      if (!this.playing()) return;
      const page = this.page();
      const timer = setTimeout(() => this.go(page + 1, true), this.autoplayInterval());
      onCleanup(() => clearTimeout(timer));
    });

    // Child-element slides: read them once rendered (and when they change) and label them like template slides
    // (carousel.css sizes every child of the track), then keep off-screen ones hidden
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (this.template()) return;
      const track = this.track().nativeElement;
      const read = () => {
        const slides = [...track.children] as HTMLElement[];
        slides.forEach((slide, i) => {
          slide.setAttribute('role', 'group');
          slide.setAttribute('aria-roledescription', 'slide');
          slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
        });
        this.slides.set(slides);
      };
      read();
      const observer = new MutationObserver(read);
      observer.observe(track, { childList: true });
      destroyRef.onDestroy(() => observer.disconnect());
    });
    effect(() =>
      this.slides().forEach((slide, i) => {
        slide.toggleAttribute('inert', !this.isVisible(i));
        slide.setAttribute('aria-hidden', String(!this.isVisible(i)));
        slide.style.setProperty('--offset', String(i - this.center()));
      }),
    );
  }

  /** Goes to a page; `wrap` loops around at the ends (autoplay always does) */
  protected go(page: number, wrap = this.circular()) {
    const count = this.pages();
    this.page.set(wrap ? (page + count) % count : Math.min(Math.max(page, 0), count - 1));
  }

  protected isVisible(index: number) {
    return index >= this.first() && index < this.first() + this.visible();
  }

  protected onKeydown(event: KeyboardEvent) {
    const [prev, next] = this.vertical() ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
    const step = { [prev]: -1, [next]: 1 }[event.key];
    if (!step) return;
    event.preventDefault();
    this.go(this.page() + step);
  }

  protected onPointerDown(event: PointerEvent) {
    this.swipeStart = this.vertical() ? event.clientY : event.clientX;
  }

  /** A drag of 50px or more along the carousel changes the page */
  protected onPointerUp(event: PointerEvent) {
    if (this.swipeStart === null) return;
    const distance = (this.vertical() ? event.clientY : event.clientX) - this.swipeStart;
    this.swipeStart = null;
    if (Math.abs(distance) >= 50) this.go(this.page() + (distance < 0 ? 1 : -1));
  }
}
