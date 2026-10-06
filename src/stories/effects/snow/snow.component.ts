import { Component, input, numberAttribute } from '@angular/core';

import { CanvasEffect, circle, fillSteps, pathSteps, type Point } from '../canvas-effect';

interface Flake extends Point {
  /** Size step (0 = small and slow, LEVELS - 1 = big and fast, closer to the viewer) */
  level: number;
  /** Sway phase in radians */
  phase: number;
}

/** Flakes are drawn in this many size steps, one path each */
const LEVELS = 4;

/** Falling snow that sways in the wind; bigger flakes are closer and fall faster. A still frame with reduced motion */
@Component({
  selector: 'np-snow',
  templateUrl: './snow.html',
  styleUrl: './snow.css',
})
export class SnowComponent extends CanvasEffect {
  /** Flakes per 1000×600 px, so the density is the same at any size */
  readonly count = input(120, { transform: numberAttribute });

  /** Flake color. Empty uses the element's text color */
  readonly color = input('');

  /** Sideways drift (negative blows left) */
  readonly wind = input(0.3, { transform: numberAttribute });

  /** Fall speed (1 = normal) */
  readonly speed = input(1, { transform: numberAttribute });

  private flakes: Flake[] = [];

  protected seed() {
    this.flakes = Array.from({ length: this.countFor(this.count()) }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      level: Math.floor(Math.random() ** 1.6 * LEVELS),
      phase: Math.random() * Math.PI * 2,
    }));
  }

  protected step(dt: number) {
    for (const f of this.flakes) {
      const near = (f.level + 1) / LEVELS;
      f.phase += 0.02 * dt;
      f.y += (0.4 + near * 1.2) * this.speed() * dt;
      f.x += (this.wind() * near + Math.sin(f.phase) * 0.3) * dt;
      if (f.y > this.height + 6) {
        f.y = -6;
        f.x = Math.random() * this.width;
      }
      if (f.x < -6) f.x = this.width + 6;
      else if (f.x > this.width + 6) f.x = -6;
    }
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = this.color() || this.textColor();
    const paths = pathSteps(LEVELS);
    for (const f of this.flakes) circle(paths[f.level], f.x, f.y, 0.8 + f.level * 0.9);
    fillSteps(ctx, paths, (k) => 0.35 + (k / LEVELS) * 0.6);
  }
}
