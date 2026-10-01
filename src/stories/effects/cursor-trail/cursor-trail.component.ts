import { Component, input, numberAttribute } from '@angular/core';

import { CanvasEffect, type Point } from '../canvas-effect';

/** Round dots, or four-pointed sparkles */
export type CursorTrailShape = 'dot' | 'sparkle';

export const CURSOR_TRAIL_SHAPES: CursorTrailShape[] = ['dot', 'sparkle'];

interface Spark extends Point {
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
}

/** Four-pointed star with radius 1: points on the axes, pinched in between */
const STAR = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  const d = i % 2 ? 0.28 : 1;
  return { x: Math.cos(a) * d, y: Math.sin(a) * d };
});

/**
 * Sparkles that follow the pointer and fade out. It's idle when nothing is fading, and leaves no trail when
 * the user prefers reduced motion.
 */
@Component({
  selector: 'nex-cursor-trail',
  templateUrl: './cursor-trail.html',
  styleUrl: './cursor-trail.css',
})
export class CursorTrailComponent extends CanvasEffect {
  /** Trail colors, used in turn. Empty uses the theme's primary and accent colors */
  readonly colors = input<string[]>([]);

  /** Largest piece size in px */
  readonly size = input(7, { transform: numberAttribute });

  /** How long each piece lasts, in frames (60 = one second) */
  readonly life = input(45, { transform: numberAttribute });

  /** Distance between pieces along the path, in px */
  readonly spacing = input(6, { transform: numberAttribute });

  /** Piece shape */
  readonly shape = input<CursorTrailShape>('sparkle');

  private sparks: Spark[] = [];
  /** Where the pointer was last, so fast moves still leave an even trail */
  private last: Point | null = null;
  private next = 0;

  protected seed() {
    this.sparks = [];
  }

  protected override active() {
    return this.sparks.length > 0;
  }

  protected override onPointerLeave() {
    this.last = null;
  }

  protected override onPointerMove(at: Point) {
    if (this.reduced) return;
    const from = this.last ?? at;
    const colors = this.palette(this.colors(), ['--ui-primary', '--ui-accent']);
    const steps = Math.max(
      1,
      Math.floor(Math.hypot(at.x - from.x, at.y - from.y) / this.spacing()),
    );
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      this.sparks.push({
        x: from.x + (at.x - from.x) * t,
        y: from.y + (at.y - from.y) * t,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        life: this.life(),
        max: this.life(),
        size: this.size() * (0.5 + Math.random() * 0.5),
        color: colors[this.next++ % colors.length],
      });
    }
    if (this.sparks.length > 600) this.sparks.splice(0, this.sparks.length - 600);
    this.last = at;
  }

  protected step(dt: number) {
    for (const s of this.sparks) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 0.03 * dt;
      s.life -= dt;
    }
    this.sparks = this.sparks.filter((s) => s.life > 0);
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    const sparkle = this.shape() === 'sparkle';
    for (const s of this.sparks) {
      const k = s.life / s.max;
      const r = s.size * k;
      ctx.globalAlpha = k;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      if (sparkle) {
        for (const v of STAR) ctx.lineTo(s.x + v.x * r, s.y + v.y * r);
        ctx.closePath();
      } else {
        ctx.arc(s.x, s.y, r / 2, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
