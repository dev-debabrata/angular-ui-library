import { Component, input, numberAttribute } from '@angular/core';

import { CanvasEffect, fillSteps, pathSteps } from '../canvas-effect';

/** Squares are drawn in this many opacity steps, one path each */
const LEVELS = 8;

/**
 * A grid of small squares that twinkle at random, like a screen of pixels. Pure canvas, batched by opacity.
 * A still frame with reduced motion.
 */
@Component({
  selector: 'np-flickering-grid',
  templateUrl: './flickering-grid.html',
  styleUrl: './flickering-grid.css',
})
export class FlickeringGridComponent extends CanvasEffect {
  /** Square size in px */
  readonly squareSize = input(4, { transform: numberAttribute });

  /** Gap between squares in px */
  readonly gap = input(6, { transform: numberAttribute });

  /** Square color. Empty uses the element's text color */
  readonly color = input('');

  /** Share of squares that change brightness per second (0–1) */
  readonly flicker = input(0.3, { transform: numberAttribute });

  /** Brightest square opacity (0–1) */
  readonly maxOpacity = input(0.35, { transform: numberAttribute });

  private cols = 0;
  private rows = 0;
  /** Brightness step per square */
  private levels = new Uint8Array(0);

  protected seed() {
    const cell = Math.max(2, this.squareSize() + this.gap());
    this.cols = Math.ceil(this.width / cell);
    this.rows = Math.ceil(this.height / cell);
    this.levels = Uint8Array.from({ length: this.cols * this.rows }, () =>
      Math.floor(Math.random() * LEVELS),
    );
  }

  protected step(dt: number) {
    // dt is in 60ths of a second
    const changes = Math.round(this.levels.length * this.flicker() * (dt / 60));
    for (let i = 0; i < changes; i++) {
      this.levels[Math.floor(Math.random() * this.levels.length)] = Math.floor(
        Math.random() * LEVELS,
      );
    }
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = this.color() || this.textColor();
    const size = this.squareSize();
    const cell = Math.max(2, size + this.gap());
    const paths = pathSteps(LEVELS);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        paths[this.levels[r * this.cols + c]].rect(c * cell, r * cell, size, size);
      }
    }
    fillSteps(ctx, paths, (k) => (k / (LEVELS - 1)) * this.maxOpacity());
  }
}
