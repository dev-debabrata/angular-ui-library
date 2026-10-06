import { Component, booleanAttribute, input, numberAttribute } from '@angular/core';

import { CanvasEffect, circle, pathSteps, type Point } from '../canvas-effect';

interface Star extends Point {
  /** Depth: 1 is far away, near 0 is passing the viewer */
  z: number;
}

/** Stars are drawn in this many depth steps (size and opacity come from depth), one path per step */
const LEVELS = 6;

/**
 * 3D starfield: stars fly towards the viewer from a vanishing point. The pointer steers the vanishing point,
 * and hovering can jump to warp speed. With reduced motion it shows a still frame.
 */
@Component({
  selector: 'np-starfield',
  templateUrl: './starfield.html',
  styleUrl: './starfield.css',
})
export class StarfieldComponent extends CanvasEffect {
  /** Number of stars */
  readonly count = input(350, { transform: numberAttribute });

  /** Star color. Empty uses the element's text color */
  readonly color = input('');

  /** Flight speed (1 = normal) */
  readonly speed = input(1, { transform: numberAttribute });

  /** Draw streaks behind the stars */
  readonly trails = input(true, { transform: booleanAttribute });

  /** Speed up to warp while the pointer is over the element */
  readonly warpOnHover = input(true, { transform: booleanAttribute });

  /** Move the vanishing point towards the pointer */
  readonly steer = input(true, { transform: booleanAttribute });

  private stars: Star[] = [];
  private boost = 1;
  private cx = 0;
  private cy = 0;

  private respawn(s: Star, z: number) {
    s.x = Math.random() * 2 - 1;
    s.y = Math.random() * 2 - 1;
    s.z = Math.max(0.05, z);
  }

  protected seed() {
    this.stars = Array.from({ length: Math.max(10, this.count()) }, () => {
      const s = { x: 0, y: 0, z: 0 };
      this.respawn(s, Math.random());
      return s;
    });
    this.cx = this.width / 2;
    this.cy = this.height / 2;
  }

  protected step(dt: number) {
    this.boost += ((this.warpOnHover() && this.pointer ? 7 : 1) - this.boost) * 0.06 * dt;
    const aim =
      this.steer() && this.pointer ? this.pointer : { x: this.width / 2, y: this.height / 2 };
    this.cx += (this.width / 2 + (aim.x - this.width / 2) * 0.35 - this.cx) * 0.05 * dt;
    this.cy += (this.height / 2 + (aim.y - this.height / 2) * 0.35 - this.cy) * 0.05 * dt;
    const dz = 0.0035 * this.speed() * this.boost * dt;
    const f = Math.max(this.width, this.height) * 0.5;
    for (const s of this.stars) {
      s.z -= dz;
      const x = this.cx + (s.x / s.z) * f;
      const y = this.cy + (s.y / s.z) * f;
      if (s.z <= 0.02 || x < -50 || x > this.width + 50 || y < -50 || y > this.height + 50)
        this.respawn(s, 1);
    }
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = ctx.strokeStyle = this.color() || this.textColor();
    ctx.lineCap = 'round';
    const streaks = this.trails() && !this.reduced;
    const tail = 0.0035 * this.speed() * this.boost * 6;
    const f = Math.max(this.width, this.height) * 0.5;
    const paths = pathSteps(LEVELS);
    for (const s of this.stars) {
      const near = 1 - s.z;
      const path = paths[Math.min(LEVELS - 1, Math.floor(near * LEVELS))];
      const x = this.cx + (s.x / s.z) * f;
      const y = this.cy + (s.y / s.z) * f;
      if (streaks) {
        const tz = Math.min(1, s.z + tail);
        path.moveTo(this.cx + (s.x / tz) * f, this.cy + (s.y / tz) * f);
        path.lineTo(x, y);
      } else {
        const r = (near * 2.4 + 0.3) / 2 + 0.3;
        circle(path, x, y, r);
      }
    }
    paths.forEach((path, k) => {
      const near = (k + 0.5) / LEVELS;
      ctx.globalAlpha = Math.min(1, near * 1.4);
      if (streaks) {
        ctx.lineWidth = near * 2.4 + 0.3;
        ctx.stroke(path);
      } else {
        ctx.fill(path);
      }
    });
    ctx.globalAlpha = 1;
  }
}
