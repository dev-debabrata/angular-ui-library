import { Component, booleanAttribute, input, numberAttribute } from '@angular/core';

import { CanvasEffect, type Point } from '../canvas-effect';

interface Ripple extends Point {
  age: number;
}

/** A ripple lives this many frames */
const RIPPLE_LIFE = 90;

/** Resting dots' opacity; dots near the pointer or a ripple go up to 1 */
const REST = 0.28;

/**
 * Grid of dots that bulge, grow and light up around the pointer; a click sends a ripple across the grid.
 * It only animates while something is moving, so an idle grid costs nothing.
 */
@Component({
  selector: 'nex-dot-grid',
  templateUrl: './dot-grid.html',
  styleUrl: './dot-grid.css',
})
export class DotGridComponent extends CanvasEffect {
  /** Dot color. Empty uses the element's text color */
  readonly color = input('');

  /** Distance between dots in px */
  readonly gap = input(26, { transform: numberAttribute });

  /** Dot radius in px */
  readonly size = input(1.6, { transform: numberAttribute });

  /** Reach of the pointer bulge in px */
  readonly radius = input(130, { transform: numberAttribute });

  /** How far dots are pushed out, in px */
  readonly strength = input(10, { transform: numberAttribute });

  /** Send a ripple from where the user clicks */
  readonly ripple = input(true, { transform: booleanAttribute });

  /** Eased pointer position and how much of the bulge is applied (0…1) */
  private focus: Point = { x: 0, y: 0 };
  private amount = 0;
  private ripples: Ripple[] = [];

  protected seed() {
    this.ripples = [];
  }

  protected override active() {
    return !!this.pointer || this.amount > 0.01 || this.ripples.length > 0;
  }

  protected override onPointerMove(at: Point) {
    if (this.amount < 0.01) this.focus = { ...at };
  }

  protected override onPointerDown(at: Point) {
    if (this.ripple() && !this.reduced) this.ripples.push({ ...at, age: 0 });
  }

  protected step(dt: number) {
    if (this.pointer) {
      this.focus.x += (this.pointer.x - this.focus.x) * 0.25 * dt;
      this.focus.y += (this.pointer.y - this.focus.y) * 0.25 * dt;
    }
    this.amount += ((this.pointer ? 1 : 0) - this.amount) * 0.12 * dt;
    for (const r of this.ripples) r.age += dt;
    this.ripples = this.ripples.filter((r) => r.age < RIPPLE_LIFE);
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = this.color() || this.textColor();
    const gap = Math.max(6, this.gap());
    const [size, radius, strength] = [this.size(), this.radius(), this.strength()];
    // A still frame (reduced motion) follows the pointer directly, without easing
    const amount = this.reduced ? (this.pointer ? 1 : 0) : this.amount;
    const focus = this.reduced && this.pointer ? this.pointer : this.focus;
    const resting = new Path2D();
    for (let gx = (this.width % gap) / 2; gx <= this.width; gx += gap) {
      for (let gy = (this.height % gap) / 2; gy <= this.height; gy += gap) {
        // How strongly this dot is pushed (0…1), and away from where
        let push = 0;
        let from: Point = focus;
        if (amount > 0.01) {
          const d2 = (gx - focus.x) ** 2 + (gy - focus.y) ** 2;
          if (d2 < radius * radius) push = (1 - Math.sqrt(d2) / radius) ** 2 * amount;
        }
        for (const r of this.ripples) {
          const ring = Math.abs(Math.hypot(gx - r.x, gy - r.y) - r.age * 7);
          const k = ring < 40 ? (1 - ring / 40) * (1 - r.age / RIPPLE_LIFE) : 0;
          if (k > push) [push, from] = [k, r];
        }
        if (push < 0.005) {
          resting.moveTo(gx + size, gy);
          resting.arc(gx, gy, size, 0, Math.PI * 2);
          continue;
        }
        const d = Math.hypot(gx - from.x, gy - from.y) || 1;
        ctx.globalAlpha = REST + push * (1 - REST);
        ctx.beginPath();
        ctx.arc(
          gx + ((gx - from.x) / d) * push * strength,
          gy + ((gy - from.y) / d) * push * strength,
          size * (1 + push * 1.8),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
    ctx.globalAlpha = REST;
    ctx.fill(resting);
    ctx.globalAlpha = 1;
  }
}
