import { Component, input, numberAttribute } from '@angular/core';

import { CanvasEffect, circle, pathSteps, type Point } from '../canvas-effect';

interface Meteor extends Point {
  /** Speed in px per frame */
  v: number;
  /** Tail length in px */
  length: number;
  /** Frames to wait before (re)entering */
  wait: number;
}

/** Tails are drawn in this many brightness steps, one path each (bright at the head, faint at the end) */
const LEVELS = 6;

/**
 * Shooting stars: meteors streak across at an angle with a fading tail, each entering after a random pause.
 * With reduced motion it shows a still frame.
 */
@Component({
  selector: 'np-meteors',
  templateUrl: './meteors.html',
  styleUrl: './meteors.css',
})
export class MeteorsComponent extends CanvasEffect {
  /** Number of meteors */
  readonly count = input(18, { transform: numberAttribute });

  /** Meteor color. Empty uses the element's text color */
  readonly color = input('');

  /** Direction of travel in degrees (0 = right, 90 = down) */
  readonly angle = input(135, { transform: numberAttribute });

  /** Speed (1 = normal) */
  readonly speed = input(1, { transform: numberAttribute });

  private meteors: Meteor[] = [];

  private direction() {
    const a = (this.angle() * Math.PI) / 180;
    return { dx: Math.cos(a), dy: Math.sin(a) };
  }

  /** A new meteor: a random point in the area, moved back along its path to just outside the edge */
  private launch(m: Meteor, wait: number) {
    const { dx, dy } = this.direction();
    const x = Math.random() * this.width;
    const y = Math.random() * this.height;
    const pad = 20;
    const back = (p: number, d: number, size: number) =>
      d > 0 ? (p + pad) / d : d < 0 ? (size - p + pad) / -d : Infinity;
    const t = Math.min(back(x, dx, this.width), back(y, dy, this.height));
    m.x = x - dx * t;
    m.y = y - dy * t;
    m.v = 6 + Math.random() * 6;
    m.length = 80 + Math.random() * 140;
    m.wait = wait;
  }

  protected seed() {
    this.meteors = Array.from({ length: Math.max(1, this.count()) }, () => {
      const m = { x: 0, y: 0, v: 0, length: 0, wait: 0 };
      this.launch(m, Math.random() * 240);
      return m;
    });
    // A still frame (reduced motion) shows the meteors mid-flight
    if (this.reduced) for (const m of this.meteors) this.advance(m, 40 + Math.random() * 80);
  }

  private advance(m: Meteor, frames: number) {
    const { dx, dy } = this.direction();
    m.x += dx * m.v * this.speed() * frames;
    m.y += dy * m.v * this.speed() * frames;
    m.wait = 0;
  }

  protected step(dt: number) {
    for (const m of this.meteors) {
      if (m.wait > 0) {
        m.wait -= dt;
        continue;
      }
      this.advance(m, dt);
      const pad = m.length + 40;
      if (m.x < -pad || m.x > this.width + pad || m.y < -pad || m.y > this.height + pad) {
        this.launch(m, 30 + Math.random() * 200);
      }
    }
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.strokeStyle = ctx.fillStyle = this.color() || this.textColor();
    ctx.lineCap = 'round';
    const { dx, dy } = this.direction();
    const tails = pathSteps(LEVELS);
    const heads = new Path2D();
    for (const m of this.meteors) {
      if (m.wait > 0) continue;
      for (let k = 0; k < LEVELS; k++) {
        const from = (k / LEVELS) * m.length;
        const to = ((k + 1) / LEVELS) * m.length;
        tails[k].moveTo(m.x - dx * from, m.y - dy * from);
        tails[k].lineTo(m.x - dx * to, m.y - dy * to);
      }
      circle(heads, m.x, m.y, 1.6);
    }
    tails.forEach((path, k) => {
      ctx.globalAlpha = (1 - k / LEVELS) * 0.85;
      ctx.lineWidth = 1.6 - (k / LEVELS) * 1.1;
      ctx.stroke(path);
    });
    ctx.globalAlpha = 1;
    ctx.fill(heads);
  }
}
