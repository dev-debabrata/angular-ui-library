import { Component, input, numberAttribute } from '@angular/core';

import { CanvasEffect, circle, pathSteps, type Point } from '../canvas-effect';

interface Firefly extends Point {
  vx: number;
  vy: number;
  /** Pulse phase in radians */
  phase: number;
  /** Pulse speed */
  rate: number;
  r: number;
}

/** Fireflies are drawn in this many brightness steps, one glowing path each */
const LEVELS = 5;

/**
 * Glowing dots that wander and pulse like fireflies. The pointer gently pushes them away. With reduced motion
 * it shows a still frame.
 */
@Component({
  selector: 'np-fireflies',
  templateUrl: './fireflies.html',
  styleUrl: './fireflies.css',
})
export class FirefliesComponent extends CanvasEffect {
  /** Fireflies per 1000×600 px, so the density is the same at any size */
  readonly count = input(60, { transform: numberAttribute });

  /** Glow color. Empty uses the element's text color */
  readonly color = input('');

  /** Dot radius in px */
  readonly size = input(2.2, { transform: numberAttribute });

  /** Speed (1 = normal) */
  readonly speed = input(1, { transform: numberAttribute });

  private flies: Firefly[] = [];

  protected seed() {
    this.flies = Array.from({ length: this.countFor(this.count()) }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      phase: Math.random() * Math.PI * 2,
      rate: 0.02 + Math.random() * 0.04,
      r: this.size() * (0.6 + Math.random() * 0.8),
    }));
  }

  protected step(dt: number) {
    const speed = this.speed() * dt;
    for (const f of this.flies) {
      // Wander: small random turns, capped speed
      f.vx = Math.max(-0.8, Math.min(0.8, f.vx + (Math.random() - 0.5) * 0.08));
      f.vy = Math.max(-0.8, Math.min(0.8, f.vy + (Math.random() - 0.5) * 0.08));
      if (this.pointer) {
        const dx = f.x - this.pointer.x;
        const dy = f.y - this.pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120 && d2 > 1) {
          const push = (1 - Math.sqrt(d2) / 120) * 0.5;
          f.vx += (dx / Math.sqrt(d2)) * push;
          f.vy += (dy / Math.sqrt(d2)) * push;
        }
      }
      f.x = (f.x + f.vx * speed + this.width) % this.width;
      f.y = (f.y + f.vy * speed + this.height) % this.height;
      f.phase += f.rate * dt;
    }
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    const color = this.color() || this.textColor();
    ctx.fillStyle = ctx.shadowColor = color;
    const paths = pathSteps(LEVELS);
    for (const f of this.flies) {
      const glow = (Math.sin(f.phase) + 1) / 2;
      circle(paths[Math.min(LEVELS - 1, Math.floor(glow * LEVELS))], f.x, f.y, f.r);
    }
    paths.forEach((path, k) => {
      const glow = (k + 0.5) / LEVELS;
      ctx.globalAlpha = 0.15 + glow * 0.85;
      ctx.shadowBlur = 4 + glow * 14;
      ctx.fill(path);
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}
