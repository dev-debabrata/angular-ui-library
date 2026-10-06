import { Component, booleanAttribute, input, numberAttribute } from '@angular/core';

import { CanvasEffect, circle, fillSteps, pathSteps } from '../canvas-effect';

/** Dots are drawn in this many depth steps (size and opacity come from depth), one path each */
const LEVELS = 8;

/**
 * A 3D surface of dots rolling like the sea, seen in perspective: near dots are bigger and stronger, far ones fade
 * towards the horizon. Layered sine waves shape it; the pointer shifts the view a little. A still frame with
 * reduced motion.
 */
@Component({
  selector: 'np-dot-wave',
  templateUrl: './dot-wave.html',
  styleUrl: './dot-wave.css',
})
export class DotWaveComponent extends CanvasEffect {
  /** Dot color. Empty uses the element's text color */
  readonly color = input('');

  /** Space between dots in px (lower is denser) */
  readonly spacing = input(14, { transform: numberAttribute });

  /** Height of the waves (1 = normal) */
  readonly amplitude = input(1, { transform: numberAttribute });

  /** Wave speed (1 = normal) */
  readonly speed = input(1, { transform: numberAttribute });

  /** Radius of the nearest dots in px */
  readonly size = input(1.8, { transform: numberAttribute });

  /** Shift the view towards the pointer */
  readonly parallax = input(true, { transform: booleanAttribute });

  private cols = 0;
  private rows = 0;
  private time = 0;
  /** Smoothed pointer offset from the center, -1 to 1 */
  private tilt = 0;

  protected seed() {
    this.cols = Math.max(20, Math.min(140, Math.round(this.width / Math.max(4, this.spacing()))));
    this.rows = Math.round(this.cols * 0.55);
  }

  protected step(dt: number) {
    this.time += 0.018 * this.speed() * dt;
    this.tilt += ((this.parallax() ? this.pointerX() : 0) - this.tilt) * 0.05 * dt;
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = this.color() || this.textColor();
    const { cols, rows, time: t } = this;
    // Camera above the surface: depth z runs from 1 (front) to 4 (horizon)
    const focal = this.width * 0.5;
    const horizon = this.height * 0.22;
    const lift = (this.height * 0.78) / focal;
    const amp = lift * 0.32 * this.amplitude();
    const paths = pathSteps(LEVELS);
    for (let j = 0; j < rows; j++) {
      const depth = j / (rows - 1);
      const z = 1 + depth * 3;
      // Step 0 is the horizon, so filling in order paints far to near
      const level = LEVELS - 1 - Math.min(LEVELS - 1, Math.floor(depth * LEVELS));
      const r = this.size() * (1.15 - depth * 0.75);
      for (let i = 0; i < cols; i++) {
        const x = (i / (cols - 1) - 0.5) * 3.2;
        const wave =
          Math.sin(x * 2.2 + t) * 0.5 +
          Math.sin(depth * 7 - t * 1.3) * 0.35 +
          Math.sin((x + depth * 3) * 1.6 - t * 0.7) * 0.3;
        const sx = this.width / 2 + ((x - this.tilt * 0.35) * focal) / z;
        const sy = horizon + ((lift - wave * amp) * focal) / z;
        if (sx > -4 && sx < this.width + 4) circle(paths[level], sx, sy, r);
      }
    }
    // Far to near, so crests in front cover the dots behind them
    fillSteps(ctx, paths, (k) => 0.9 - ((LEVELS - 1 - k) / LEVELS) * 0.75);
  }
}
