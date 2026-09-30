import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  PLATFORM_ID,
  booleanAttribute,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import type { AnimationItem } from 'lottie-web';

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

/**
 * Plays a Lottie animation (.json or .lottie from LottieFiles, After Effects + Bodymovin, …) as SVG. The player (lottie-web) is
 * loaded on first use, only in the browser. With "reduce motion" on, the last frame is shown still.
 */
@Component({
  selector: 'nex-lottie',
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

  /** Playback speed (1 = normal) */
  readonly speed = input(1, { transform: numberAttribute });

  /** Width and height (any CSS length) */
  readonly size = input('200px');

  /** Accessible name. Leave empty for decorative animations */
  readonly ariaLabel = input('');

  /** Emits when the animation is ready */
  readonly loaded = output<void>();

  /** Emits when a non-looping animation reaches its end */
  readonly complete = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly animation = signal<AnimationItem | null>(null);

  constructor() {
    // (Re)create the animation when the source or playback mode changes
    effect((onCleanup) => {
      const [src, data, loop] = [this.src(), this.data(), this.loop()];
      const autoplay = this.autoplay() && !this.hover();
      if (!this.browser || (!src && !data)) return;
      let cancelled = false;
      const source = data
        ? Promise.resolve(structuredClone(data)) // lottie-web changes the data it's given, so pass a copy
        : src.split('?')[0].endsWith('.lottie')
          ? loadDotLottie(src)
          : null;
      Promise.all([import('lottie-web/build/player/lottie_light'), source]).then(
        ([{ default: lottie }, animationData]) => {
          if (cancelled) return;
          const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
          const animation = lottie.loadAnimation({
            container: this.host.querySelector('.lottie')!,
            renderer: 'svg',
            loop,
            autoplay: autoplay && !reduced,
            ...(animationData ? { animationData } : { path: src }),
          });
          animation.addEventListener('DOMLoaded', () => {
            if (reduced) animation.goToAndStop(animation.totalFrames - 1, true);
            this.loaded.emit();
          });
          animation.addEventListener('complete', () => this.complete.emit());
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

    effect(() => this.animation()?.setSpeed(this.speed()));
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
}
