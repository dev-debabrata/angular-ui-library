import { Component, booleanAttribute, input, numberAttribute } from '@angular/core';

import { CanvasEffect, circle, fillSteps, pathSteps } from '../canvas-effect';

/** Dots are drawn in this many depth steps (size and opacity come from depth), one path each */
const LEVELS = 8;

/** Distance from the camera to the ribbon's center line */
const DISTANCE = 2.4;

/** Length of the ribbon in world units; it spans the element's width */
const LENGTH = 2.4;

/** Half the ribbon's width at its widest, in the same units as LENGTH */
const HALF_WIDTH = 1;

/**
 * A ribbon of dots floating across the element: it waves, twists along its length and changes width, so it
 * folds into dense bands where it turns edge-on. Near dots are bigger and stronger; the pointer turns it a
 * little. A still frame with reduced motion.
 */
@Component({
  selector: 'np-dot-ribbon',
  templateUrl: './dot-ribbon.html',
  styleUrl: './dot-ribbon.css',
})
export class DotRibbonComponent extends CanvasEffect {
  /** Dot color. Empty uses the element's text color */
  readonly color = input('');

  /** Space between dots in px (lower is denser) */
  readonly spacing = input(10, { transform: numberAttribute });

  /** How much it twists (1 = normal) */
  readonly twist = input(1, { transform: numberAttribute });

  /** Height of the waves (1 = normal) */
  readonly amplitude = input(1, { transform: numberAttribute });

  /** Speed (1 = normal) */
  readonly speed = input(1, { transform: numberAttribute });

  /** Radius of the nearest dots in px */
  readonly size = input(1.7, { transform: numberAttribute });

  /** Turn the ribbon towards the pointer */
  readonly parallax = input(true, { transform: booleanAttribute });

  private cols = 0;
  private rows = 0;
  /** A small fixed offset per dot (u, v pairs), so the surface looks organic rather than a rigid grid */
  private jitter = new Float32Array(0);
  private time = 0;
  /** Smoothed pointer offset from the center, -1 to 1 */
  private turn = 0;

  protected seed() {
    this.cols = Math.max(30, Math.min(260, Math.round(this.width / Math.max(3, this.spacing()))));
    // As many dots across as fit the ribbon's height on screen, so dots are about evenly spaced both ways
    const across = (2 * HALF_WIDTH * 0.8 * this.height * 0.95) / DISTANCE;
    this.rows = Math.max(6, Math.min(120, Math.round(across / Math.max(3, this.spacing()))));
    this.jitter = Float32Array.from(
      { length: this.cols * this.rows * 2 },
      () => (Math.random() - 0.5) * 0.6,
    );
  }

  protected step(dt: number) {
    this.time += 0.012 * this.speed() * dt;
    this.turn += ((this.parallax() ? this.pointerX() : 0) - this.turn) * 0.05 * dt;
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = this.color() || this.textColor();
    const { cols, rows, jitter, time: t } = this;
    // The ribbon spans the width at the center distance
    const fx = (this.width * DISTANCE) / LENGTH;
    const fy = this.height * 0.95;
    const yaw = this.turn * 0.35;
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const paths = pathSteps(LEVELS);
    for (let i = 0; i < cols; i++) {
      const u = (i + jitter[i * rows * 2]) / (cols - 1);
      const x0 = (u - 0.5) * LENGTH;
      const center =
        (Math.sin(u * 4 + t) * 0.3 + Math.sin(u * 9 - t * 1.4) * 0.12) * this.amplitude();
      // Mostly facing the viewer; where it nearly turns edge-on, the dots crowd into a crease
      const angle =
        (0.35 + Math.sin(u * 2.5 + t * 0.6) * 0.7 + Math.sin(u * 6 - t) * 0.35) * this.twist();
      const half = HALF_WIDTH * (0.6 + 0.4 * Math.sin(u * 5 + t * 0.8));
      for (let j = 0; j < rows; j++) {
        const v = ((j + jitter[(i * rows + j) * 2 + 1]) / (rows - 1)) * 2 - 1;
        // A ripple across the sheet bends it into soft folds
        const y =
          center +
          v * half * Math.cos(angle) +
          Math.sin(v * 3 + u * 4 - t) * 0.07 * this.amplitude();
        const z0 = v * half * Math.sin(angle);
        // Turn around the vertical axis, then project
        const x = x0 * cos - z0 * sin;
        const depth = DISTANCE + x0 * sin + z0 * cos;
        const near = Math.min(1, Math.max(0, DISTANCE + 0.5 - depth));
        const level = Math.min(LEVELS - 1, Math.floor(near * LEVELS));
        const sx = this.width / 2 + (x * fx) / depth;
        const sy = this.height / 2 + (y * fy) / depth;
        circle(paths[level], sx, sy, this.size() * (0.45 + near * 0.75));
      }
    }
    // Far to near, so the front of the ribbon covers the back
    fillSteps(ctx, paths, (k) => 0.18 + (k / (LEVELS - 1)) * 0.72);
  }
}
