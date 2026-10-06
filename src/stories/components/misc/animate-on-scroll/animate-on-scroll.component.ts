import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';

export const SCROLL_ANIMATIONS = [
  'fade-up',
  'fade-down',
  'fade-left',
  'fade-right',
  'zoom-in',
  'flip',
  'blur-in',
  'blur-up',
  'tilt',
] as const;
export type ScrollAnimation = (typeof SCROLL_ANIMATIONS)[number];

@Component({
  selector: 'np-animate-on-scroll',
  templateUrl: './animate-on-scroll.html',
  styleUrl: './animate-on-scroll.css',
  host: {
    '[class]': "'aos--' + animation()",
    '[class.aos--visible]': 'visible()',
    '[style.--aos-delay.ms]': 'delay()',
    '[style.--aos-duration.ms]': 'duration()',
    '[style.--aos-stagger.ms]': 'stagger()',
    '[class.aos--stagger]': 'stagger() > 0',
    '[class.aos--scrub]': 'scrub()',
  },
})
export class AnimateOnScrollComponent {
  /** Entrance animation: fade-up/down/left/right, zoom-in, flip, blur-in, blur-up (blur and rise) or tilt (3D swing) */
  readonly animation = input<ScrollAnimation>('fade-up');
  /** Wait before the animation starts, in milliseconds */
  readonly delay = input(0, { transform: numberAttribute });
  /** Animation length, in milliseconds */
  readonly duration = input(600, { transform: numberAttribute });
  /** Animate only the first time? When false, it replays every time it re-enters the view */
  readonly once = input(true, { transform: booleanAttribute });
  /** How much of the element (0 to 1) must be visible to trigger */
  readonly threshold = input(0.15, { transform: numberAttribute });
  /** Scroll container to observe. Leave empty to use the browser viewport */
  readonly root = input<HTMLElement | null>(null);
  /** Animate the direct children one after another, this many milliseconds apart (0 animates the whole block) */
  readonly stagger = input(0, { transform: numberAttribute });
  /** Tie the reveal to the scroll position (CSS scroll-driven animation; falls back to the normal reveal) */
  readonly scrub = input(false, { transform: booleanAttribute });
  /** Emitted when the content enters the view */
  readonly enter = output<void>();
  /** Emitted when the content leaves the view */
  readonly leave = output<void>();

  protected readonly visible = signal(false);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let observer: IntersectionObserver | undefined;
    inject(DestroyRef).onDestroy(() => observer?.disconnect());

    afterNextRender(() => {
      if (this.stagger()) {
        [...host.children].forEach((child, i) =>
          (child as HTMLElement).style.setProperty('--aos-i', String(i)),
        );
      }
      // No motion wanted (or no observer support): show the content right away
      if (
        matchMedia('(prefers-reduced-motion: reduce)').matches ||
        !('IntersectionObserver' in window)
      ) {
        this.visible.set(true);
        return;
      }
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.visible.set(true);
            this.enter.emit();
            if (this.once()) observer?.disconnect();
          } else if (this.visible()) {
            this.visible.set(false);
            this.leave.emit();
          }
        },
        { root: this.root(), threshold: this.threshold() },
      );
      observer.observe(host);
    });
  }
}
