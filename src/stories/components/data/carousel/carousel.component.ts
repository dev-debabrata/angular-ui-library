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

  /** Number of slides */
  protected readonly count = computed(() =>
    this.template() ? this.items().length : this.slides().length,
  );

  protected readonly pages = computed(() =>
    Math.max(1, Math.ceil((this.count() - this.numVisible()) / this.numScroll()) + 1),
  );

  protected readonly pageList = computed(() => Array.from({ length: this.pages() }, (_, i) => i));

  /** Index of the first visible item; the last page is aligned to the end */
  protected readonly first = computed(() =>
    Math.max(0, Math.min(this.page() * this.numScroll(), this.count() - this.numVisible())),
  );

  protected readonly canPrev = computed(() => this.circular() || this.page() > 0);
  protected readonly canNext = computed(() => this.circular() || this.page() < this.pages() - 1);

  /** Pointer x where a swipe started */
  private swipeStart: number | null = null;

  constructor() {
    // Keep the page valid when items or sizes change
    effect(() => this.page() >= this.pages() && this.page.set(this.pages() - 1));

    effect((onCleanup) => {
      const interval = this.autoplayInterval();
      if (!interval || this.paused() || this.pages() < 2) return;
      const timer = setInterval(() => this.go(this.page() + 1, true), interval);
      onCleanup(() => clearInterval(timer));
    });

    // Child-element slides: read them once rendered (and when they change), size and label them like template
    // slides, then keep off-screen ones hidden
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (this.template()) return;
      const track = this.track().nativeElement;
      const read = () => {
        const slides = [...track.children] as HTMLElement[];
        slides.forEach((slide, i) => {
          slide.style.cssText +=
            ';flex: 0 0 calc((100% - (var(--visible) - 1) * var(--gap)) / var(--visible)); min-width: 0';
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
      }),
    );
  }

  /** Goes to a page; `wrap` loops around at the ends (autoplay always does) */
  protected go(page: number, wrap = this.circular()) {
    const count = this.pages();
    this.page.set(wrap ? (page + count) % count : Math.min(Math.max(page, 0), count - 1));
  }

  protected isVisible(index: number) {
    return index >= this.first() && index < this.first() + this.numVisible();
  }

  protected onKeydown(event: KeyboardEvent) {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!step) return;
    event.preventDefault();
    this.go(this.page() + step);
  }

  protected onPointerDown(event: PointerEvent) {
    this.swipeStart = event.clientX;
  }

  /** A horizontal drag of 50px or more changes the page */
  protected onPointerUp(event: PointerEvent) {
    if (this.swipeStart === null) return;
    const distance = event.clientX - this.swipeStart;
    this.swipeStart = null;
    if (Math.abs(distance) >= 50) this.go(this.page() + (distance < 0 ? 1 : -1));
  }
}
