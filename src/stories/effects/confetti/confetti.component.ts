import { Component, input, numberAttribute } from '@angular/core';

import { CHART_COLOR_VARS, CanvasEffect, type Point } from '../canvas-effect';

/** `click` bursts where the user clicks; `manual` only bursts when `fire()` is called */
export type ConfettiTrigger = 'click' | 'manual';

export const CONFETTI_TRIGGERS: ConfettiTrigger[] = ['click', 'manual'];

interface Piece extends Point {
  vx: number;
  vy: number;
  spin: number;
  turn: number;
  flip: number;
  size: number;
  color: string;
  round: boolean;
  life: number;
}

/**
 * Confetti bursts on a canvas over the content: on click, or from code with `fire()`. It's idle (no animation
 * loop) between bursts, and does nothing when the user prefers reduced motion.
 */
@Component({
  selector: 'nex-confetti',
  templateUrl: './confetti.html',
  styleUrl: './confetti.css',
})
export class ConfettiComponent extends CanvasEffect {
  /** Piece colors. Empty uses the theme's chart colors */
  readonly colors = input<string[]>([]);

  /** Pieces per burst */
  readonly count = input(90, { transform: numberAttribute });

  /** Angle of the cone the pieces fly out in, in degrees */
  readonly spread = input(70, { transform: numberAttribute });

  /** Gravity (1 = normal) */
  readonly gravity = input(1, { transform: numberAttribute });

  /** What starts a burst */
  readonly trigger = input<ConfettiTrigger>('click');

  private pieces: Piece[] = [];

  /** Burst from a point in the element (px from its top-left), or from its lower middle */
  fire(x = this.width / 2, y = this.height * 0.7) {
    if (!this.ctx || this.reduced) return;
    const colors = this.palette(this.colors(), CHART_COLOR_VARS);
    const spread = (this.spread() * Math.PI) / 180;
    for (let i = 0; i < this.count(); i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
      const speed = 7 + Math.random() * 8;
      this.pieces.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        spin: Math.random() * Math.PI,
        turn: (Math.random() - 0.5) * 0.3,
        flip: Math.random() * Math.PI,
        size: 6 + Math.random() * 6,
        color: colors[i % colors.length],
        round: Math.random() < 0.3,
        life: 160 + Math.random() * 60,
      });
    }
    this.schedule();
  }

  protected seed() {
    this.pieces = [];
  }

  protected override active() {
    return this.pieces.length > 0;
  }

  protected override onPointerDown({ x, y }: Point) {
    if (this.trigger() === 'click') this.fire(x, y);
  }

  protected step(dt: number) {
    const fall = 0.28 * this.gravity() * dt;
    const drag = 0.985 ** dt;
    for (const p of this.pieces) {
      p.vy = (p.vy + fall) * drag;
      p.vx *= drag;
      p.x += (p.vx + Math.sin(p.flip) * 0.6) * dt;
      p.y += p.vy * dt;
      p.spin += p.turn * dt;
      p.flip += 0.12 * dt;
      p.life -= dt;
    }
    this.pieces = this.pieces.filter((p) => p.life > 0 && p.y < this.height + 30);
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    for (const p of this.pieces) {
      ctx.globalAlpha = Math.min(1, p.life / 40);
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin);
      ctx.scale(1, Math.cos(p.flip));
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}
