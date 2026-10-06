import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  booleanAttribute,
  effect,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import type { AnimationItem } from 'lottie-web';

import { IconComponent } from '../icon/icon.component';

/** Play directions: forward, reverse (backwards) or bounce (forward, then back) */
export const LOTTIE_DIRECTIONS = ['forward', 'reverse', 'bounce'] as const;
export type LottieDirection = (typeof LOTTIE_DIRECTIONS)[number];

/** Reads a .lottie file (a zip: manifest, animations/ or a/, images/ or i/) into Lottie JSON with images inlined */
async function loadDotLottie(url: string): Promise<object> {
  const [{ unzipSync, strFromU8 }, response] = await Promise.all([import('fflate'), fetch(url)]);
  if (!response.ok) throw new Error(`Lottie file not found: ${url}`);
  const files = unzipSync(new Uint8Array(await response.arrayBuffer()));
  const manifest = files['manifest.json'] ? JSON.parse(strFromU8(files['manifest.json'])) : {};
  const id = manifest.animations?.[0]?.id;
  const names = Object.keys(files);
  const name =
    names.find((n) => n === `animations/${id}.json` || n === `a/${id}.json`) ??
    names.find((n) => /^(animations|a)\/.+\.json$/.test(n));
  if (!name) throw new Error(`No animation in ${url}`);
  const data = JSON.parse(strFromU8(files[name]));
  for (const asset of data.assets ?? []) {
    const image = asset.p && (files[`images/${asset.p}`] ?? files[`i/${asset.p}`]);
    if (!image) continue;
    let binary = '';
    for (let i = 0; i < image.length; i += 0x8000)
      binary += String.fromCharCode(...image.subarray(i, i + 0x8000));
    const type = asset.p.endsWith('.svg') ? 'svg+xml' : asset.p.split('.').pop();
    Object.assign(asset, { u: '', p: `data:image/${type};base64,${btoa(binary)}`, e: 1 });
  }
  return data;
}

const isDotLottie = (url: string) => url.split('?')[0].endsWith('.lottie');

/** Lottie JSON from a .json or .lottie URL */
export async function loadLottie(url: string): Promise<object> {
  if (isDotLottie(url)) return loadDotLottie(url);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Lottie file not found: ${url}`);
  return response.json();
}

/**
 * Plays a Lottie animation (.json or .lottie from LottieFiles, After Effects + Bodymovin, …) as SVG. The player (lottie-web) is
 * loaded on first use, only in the browser. With "reduce motion" on, the last frame is shown still.
 */
@Component({
  selector: 'np-lottie',
  imports: [IconComponent],
  templateUrl: './lottie.html',
  styleUrl: './lottie.css',
  host: {
    '[attr.role]': "ariaLabel() ? 'img' : null",
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-hidden]': '!ariaLabel() || null',
    '[style.width]': 'size()',
    '[style.height]': 'size()',
    '(mouseenter)': 'hover() && play()',
    '(mouseleave)': 'hover() && pause()',
  },
})
export class LottieComponent {
  /** URL of a Lottie file: .json, or .lottie (the zipped format LottieFiles offers) */
  readonly src = input('');

  /** Animation data (a parsed Lottie JSON object), instead of `src` */
  readonly data = input<object | null>(null);

  /** Repeat forever */
  readonly loop = input(true, { transform: booleanAttribute });

  /** Start playing once loaded */
  readonly autoplay = input(true, { transform: booleanAttribute });

  /** Play only while hovered (overrides autoplay) */
  readonly hover = input(false, { transform: booleanAttribute });

  /** Hold the current frame (e.g. while an overlay covers it); unpausing resumes autoplay */
  readonly paused = input(false, { transform: booleanAttribute });

  /** Playback speed (1 = normal) */
  readonly speed = input(1, { transform: numberAttribute });

  /** Width and height (any CSS length) */
  readonly size = input('200px');

  /** Accessible name. Leave empty for decorative animations */
  readonly ariaLabel = input('');

  /** Play direction: forward, reverse (backwards) or bounce (forward, then back) */
  readonly direction = input<LottieDirection>('forward');
  /** Show a player bar over the bottom edge: play/pause, a scrubber and a speed toggle */
  readonly controls = input(false, { transform: booleanAttribute });
  /** Emits when the animation is ready */
  readonly loaded = output<void>();

  /** Emits when a non-looping animation reaches its end */
  readonly complete = output<void>();
  /** Emits at the end of each loop (each way, with bounce) */
  readonly loopComplete = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly animation = signal<AnimationItem | null>(null);
  /** Off screen the animation holds its frame, so pages with many animations stay fast */
  private readonly onScreen = signal(true);
  /** Player bar state: playing, current and last frame, speed (the speed toggle overrides `speed`) */
  protected readonly playing = signal(false);
  protected readonly frame = signal(0);
  protected readonly frames = signal(0);
  protected readonly rate = linkedSignal(() => this.speed());

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new IntersectionObserver(([entry]) =>
        this.onScreen.set(entry.isIntersecting),
      );
      observer.observe(this.host);
      destroyRef.onDestroy(() => observer.disconnect());
    });

    // (Re)create the animation when the source or playback mode changes
    effect((onCleanup) => {
      const [src, data, loop, direction] = [this.src(), this.data(), this.loop(), this.direction()];
      const controls = this.controls();
      const autoplay = this.autoplay() && !this.hover();
      if (!this.browser || (!src && !data)) return;
      let cancelled = false;
      const source = data
        ? Promise.resolve(structuredClone(data)) // lottie-web changes the data it's given, so pass a copy
        : isDotLottie(src)
          ? loadDotLottie(src)
          : null;
      Promise.all([import('lottie-web/build/player/lottie_light'), source]).then(
        ([{ default: lottie }, animationData]) => {
          if (cancelled) return;
          const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
          const animation = lottie.loadAnimation({
            container: this.host.querySelector('.lottie')!,
            renderer: 'svg',
            loop: loop && direction !== 'bounce',
            // Reverse starts from the last frame once loaded
            autoplay: autoplay && !reduced && direction !== 'reverse',
            ...(animationData ? { animationData } : { path: src }),
          });
          animation.addEventListener('DOMLoaded', () => {
            if (reduced) animation.goToAndStop(animation.totalFrames - 1, true);
            else if (direction === 'reverse') {
              animation.setDirection(-1);
              animation.goToAndStop(animation.totalFrames - 1, true);
              if (autoplay && !this.paused() && this.onScreen()) animation.play();
            }
            this.frames.set(animation.totalFrames - 1);
            this.loaded.emit();
          });
          animation.addEventListener('complete', () => {
            // Bounce turns around at each end (and stops back at the start without loop)
            if (direction === 'bounce' && (loop || animation.playDirection > 0)) {
              animation.setDirection(animation.playDirection > 0 ? -1 : 1);
              animation.play();
              this.loopComplete.emit();
            } else this.complete.emit();
          });
          animation.addEventListener('loopComplete', () => this.loopComplete.emit());
          // Only the controls' scrubber needs every frame (the NexLottie grid plays many animations)
          if (controls)
            animation.addEventListener('enterFrame', () => this.frame.set(animation.currentFrame));
          // lottie-web's own play/pause events, which its types leave out
          animation.addEventListener('_play' as never, () => this.playing.set(true));
          animation.addEventListener('_pause' as never, () => this.playing.set(false));
          this.animation.set(animation);
        },
        (error: Error) => console.warn(error.message),
      );
      onCleanup(() => {
        cancelled = true;
        this.animation()?.destroy();
        this.animation.set(null);
      });
    });

    effect(() => this.animation()?.setSpeed(this.rate()));

    // Pause and resume without recreating the animation (also when it leaves or comes back on screen)
    effect(() => {
      const animation = this.animation();
      if (!animation) return;
      if (this.paused() || !this.onScreen()) animation.pause();
      else if (
        this.autoplay() &&
        !this.hover() &&
        !matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        animation.play();
    });
  }

  /** Play from the current frame */
  play() {
    this.animation()?.play();
  }

  /** Pause on the current frame */
  pause() {
    this.animation()?.pause();
  }

  /** Stop and go back to the first frame */
  stop() {
    this.animation()?.stop();
  }

  /** Jump to a frame and hold it */
  seek(frame: number) {
    this.animation()?.goToAndStop(frame, true);
  }
}
