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

export type ScrollAnimation =
  'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'flip';

export const SCROLL_ANIMATIONS: ScrollAnimation[] = [
  'fade-up',
  'fade-down',
  'fade-left',
  'fade-right',
  'zoom-in',
  'flip',
];

@Component({
  selector: 'np-animate-on-scroll',
  templateUrl: './animate-on-scroll.html',
  styleUrl: './animate-on-scroll.css',
  host: {
    '[class]': "'aos--' + animation()",
    '[class.aos--visible]': 'visible()',
    '[style.--aos-delay.ms]': 'delay()',
    '[style.--aos-duration.ms]': 'duration()',
  },
})
export class AnimateOnScrollComponent {
  /** Entrance animation played when the content scrolls into view */
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
