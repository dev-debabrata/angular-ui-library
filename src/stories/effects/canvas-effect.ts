import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';

/** A point in the effect's own coordinates (px from its top-left corner) */
export interface Point {
  x: number;
  y: number;
}

/** Default palette of multi-color effects (Waves, Aurora) */
export const THEME_COLOR_VARS = ['--ui-primary', '--ui-accent', '--ui-chart-5', '--ui-chart-3'];

/** Chart colors for Confetti (--ui-chart-6, a dark green, is left out) */
export const CHART_COLOR_VARS = [1, 2, 3, 4, 5, 7, 8].map((i) => `--ui-chart-${i}`);

/** Pointer position relative to an element's top-left corner */
export function localPoint(el: HTMLElement, e: PointerEvent): Point {
  const rect = el.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

/**
 * Shared engine for the canvas effects (Particles, Matrix Rain, Starfield, Waves, Dot Grid, Confetti, Cursor
 * Trail). It sizes the canvas to the host (with device pixel ratio), tracks the pointer, and runs the animation
 * loop only while it's useful: on screen, in a visible tab, without reduced motion, and while `active()`.
 * Inputs read in `seed()` reseed and inputs read in `draw()` repaint, so idle and still canvases never go stale.
 * Everything starts after the first render in the browser, so the components are SSR-safe.
 *
 * Subclasses provide `seed`, `step` and `draw`; their template is a `<canvas>` plus the projected content.
 */
@Directive({ host: { class: 'nex-effect' } })
export abstract class CanvasEffect {
  protected readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  protected ctx: CanvasRenderingContext2D | null = null;
  protected width = 0;
  protected height = 0;
  /** Pointer position while it's over the effect */
  protected pointer: Point | null = null;
  /** The user prefers reduced motion: the effect shows a still frame */
  protected reduced = false;
  private raf = 0;
  private lastFrame = 0;
  private onScreen = true;
  /** Set once the canvas has a size; the seed/draw effects wait for it */
  private readonly ready = signal(false);
  /** Resolved CSS colors, refreshed on resize (getComputedStyle per frame would force style work) */
  private readonly css = new Map<string, string>();

  constructor() {
    afterNextRender(() => this.start());
    effect(() => {
      if (!this.ready()) return;
      this.seed();
      untracked(() => this.repaint());
    });
    effect(() => {
      if (this.ready()) this.draw(this.ctx!);
    });
  }

  /** Build the state for the current size (also called after a big resize) */
  protected abstract seed(): void;

  /** Advance the animation by `dt` frames (1 = 1/60 s) */
  protected abstract step(dt: number): void;

  /** Paint the current state. The canvas isn't cleared first, so effects can leave trails */
  protected abstract draw(ctx: CanvasRenderingContext2D): void;

  /** Keep the loop running? Effects that idle between bursts return false when nothing is moving */
  protected active() {
    return true;
  }

  protected onPointerDown(_at: Point) {}

  protected onPointerMove(_at: Point) {}

  protected onPointerLeave() {}

  /** A CSS custom property (or 'color' for the text color) of the host, cached */
  protected cssValue(name: string) {
    let value = this.css.get(name);
    if (value === undefined) {
      const style = getComputedStyle(this.host);
      value = (name === 'color' ? style.color : style.getPropertyValue(name)).trim();
      this.css.set(name, value);
    }
    return value;
  }

  /** The element's text color, used when no color is set */
  protected textColor() {
    return this.cssValue('color');
  }

  /** The given colors, or the theme colors behind `vars` when none are set */
  protected palette(colors: readonly string[], vars: readonly string[] = THEME_COLOR_VARS) {
    return colors.length ? colors : vars.map((v) => this.cssValue(v)).filter(Boolean);
  }

  /** Start or stop the loop as needed (e.g. after a click adds pieces) */
  protected schedule() {
    const run =
      this.onScreen &&
      !this.reduced &&
      document.visibilityState === 'visible' &&
      !!this.width &&
      this.active();
    if (run && !this.raf) {
      this.lastFrame = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    } else if (!run && this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  private repaint() {
    if (this.ctx && this.width) this.draw(this.ctx);
  }

  /** After pointer input: update a still frame, and start the loop if it's needed now */
  private poke() {
    if (!this.raf) this.repaint();
    this.schedule();
  }

  private start() {
    const canvas = this.host.querySelector('canvas');
    this.ctx = canvas?.getContext('2d') ?? null;
    if (!canvas || !this.ctx) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    this.reduced = motion.matches;

    const listeners = new AbortController();
    const signal = { signal: listeners.signal };
    this.host.addEventListener(
      'pointermove',
      (e) => {
        this.pointer = localPoint(this.host, e);
        this.onPointerMove(this.pointer);
        this.poke();
      },
      signal,
    );
    this.host.addEventListener(
      'pointerleave',
      () => {
        this.pointer = null;
        this.onPointerLeave();
        this.poke();
      },
      signal,
    );
    this.host.addEventListener(
      'pointerdown',
      (e) => {
        this.onPointerDown(localPoint(this.host, e));
        this.poke();
      },
      signal,
    );
    document.addEventListener('visibilitychange', () => this.schedule(), signal);
    motion.addEventListener(
      'change',
      (e) => {
        this.reduced = e.matches;
        this.seed();
        this.repaint();
        this.schedule();
      },
      signal,
    );

    const resize = new ResizeObserver(() => this.resize(canvas));
    resize.observe(this.host);
    const intersection = new IntersectionObserver(([entry]) => {
      this.onScreen = entry.isIntersecting;
      this.schedule();
    });
    intersection.observe(this.host);

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(this.raf);
      listeners.abort();
      resize.disconnect();
      intersection.disconnect();
    });
  }

  private resize(canvas: HTMLCanvasElement) {
    const { width, height } = this.host.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const changed = Math.abs(width * height - this.width * this.height) > 0.2 * width * height;
    this.width = width;
    this.height = height;
    this.css.clear();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    this.ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    // The first time, the seed effect seeds (and starts tracking the inputs seed() reads)
    if (changed && this.ready()) this.seed();
    this.ready.set(true);
    this.repaint();
    this.schedule();
  }

  private readonly frame = (now: number) => {
    const dt = Math.min(3, (now - this.lastFrame) / 16.67);
    this.lastFrame = now;
    this.step(dt);
    this.draw(this.ctx!);
    this.raf = this.active() ? requestAnimationFrame(this.frame) : 0;
  };
}
