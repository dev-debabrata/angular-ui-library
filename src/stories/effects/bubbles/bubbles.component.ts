import { Component, input, numberAttribute } from '@angular/core';

import { CanvasEffect, circle, pathSteps, type Point } from '../canvas-effect';

interface Bubble extends Point {
  r: number;
  /** Rise speed in px per frame */
  v: number;
  /** Wobble phase in radians */
  phase: number;
}

/** Bubbles are drawn in this many size steps, one path each */
const LEVELS = 4;

/** Bubbles rise and wobble from the bottom, each with a small highlight. A still frame with reduced motion */
@Component({
  selector: 'np-bubbles',
  templateUrl: './bubbles.html',
  styleUrl: './bubbles.css',
})
export class BubblesComponent extends CanvasEffect {
  /** Bubbles per 1000×600 px, so the density is the same at any size */
  readonly count = input(40, { transform: numberAttribute });

  /** Bubble color. Empty uses the element's text color */
  readonly color = input('');

  /** Largest bubble radius in px */
  readonly maxSize = input(18, { transform: numberAttribute });

  /** Rise speed (1 = normal) */
  readonly speed = input(1, { transform: numberAttribute });

  private bubbles: Bubble[] = [];

  private spawn(b: Bubble, anywhere: boolean) {
    b.r = 3 + Math.random() * Math.max(1, this.maxSize() - 3);
    b.x = Math.random() * this.width;
    b.y = anywhere ? Math.random() * this.height : this.height + b.r;
    b.v = 0.3 + Math.random() * 0.8;
    b.phase = Math.random() * Math.PI * 2;
  }

  protected seed() {
    this.bubbles = Array.from({ length: this.countFor(this.count()) }, () => {
      const b = { x: 0, y: 0, r: 0, v: 0, phase: 0 };
      this.spawn(b, true);
      return b;
    });
  }

  protected step(dt: number) {
    for (const b of this.bubbles) {
      b.phase += 0.03 * dt;
      b.y -= b.v * this.speed() * dt;
      b.x += Math.sin(b.phase) * 0.4 * dt;
      if (b.y < -b.r) this.spawn(b, false);
    }
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = ctx.strokeStyle = this.color() || this.textColor();
    const max = Math.max(4, this.maxSize());
    const rims = pathSteps(LEVELS);
    const shine = new Path2D();
    for (const b of this.bubbles) {
      const level = Math.min(LEVELS - 1, Math.floor((b.r / max) * LEVELS));
      circle(rims[level], b.x, b.y, b.r);
      circle(shine, b.x - b.r * 0.4, b.y - b.r * 0.4, b.r * 0.22);
    }
    ctx.lineWidth = 1.2;
    rims.forEach((path, k) => {
      const big = (k + 1) / LEVELS;
      ctx.globalAlpha = 0.06 + big * 0.06;
      ctx.fill(path);
      ctx.globalAlpha = 0.25 + big * 0.35;
      ctx.stroke(path);
    });
    ctx.globalAlpha = 0.7;
    ctx.fill(shine);
    ctx.globalAlpha = 1;
  }
}
