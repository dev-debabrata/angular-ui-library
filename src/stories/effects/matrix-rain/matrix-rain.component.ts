import { Component, booleanAttribute, input, numberAttribute } from '@angular/core';

import { CanvasEffect } from '../canvas-effect';

const GLYPHS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789';

/**
 * "Digital rain": columns of falling characters that leave fading trails, over any background.
 * With reduced motion it shows a still frame.
 */
@Component({
  selector: 'np-matrix-rain',
  templateUrl: './matrix-rain.html',
  styleUrl: './matrix-rain.css',
})
export class MatrixRainComponent extends CanvasEffect {
  /** Character color. Empty uses the element's text color */
  readonly color = input('');

  /** Character size in px (also the column width) */
  readonly fontSize = input(16, { transform: numberAttribute });

  /** Fall speed (1 = normal) */
  readonly speed = input(1, { transform: numberAttribute });

  /** Characters to pick from */
  readonly characters = input(GLYPHS);

  /** How quickly trails fade, 0–1 (higher = shorter trails) */
  readonly fade = input(0.08, { transform: numberAttribute });

  /** Draw the leading character of each column in white */
  readonly highlight = input(true, { transform: booleanAttribute });

  /** Row of each column's leading character, how fast each column falls, and the last row drawn */
  private drops: number[] = [];
  private rates: number[] = [];
  private rows: number[] = [];

  private glyph() {
    const chars = this.characters() || GLYPHS;
    return chars[Math.floor(Math.random() * chars.length)];
  }

  protected seed() {
    const rowsTall = this.height / this.fontSize();
    // Animated columns start above the top at staggered heights; a still frame scatters them over the area
    const sign = this.reduced ? 1 : -1;
    this.drops = Array.from(
      { length: Math.ceil(this.width / this.fontSize()) },
      () => sign * Math.random() * rowsTall,
    );
    this.rates = this.drops.map(() => 0.6 + Math.random() * 0.8);
    this.rows = this.drops.map(Math.floor);
    this.ctx?.clearRect(0, 0, this.width, this.height);
  }

  protected step(dt: number) {
    const rowsTall = this.height / this.fontSize();
    const fall = this.speed() * 0.35 * dt;
    for (let i = 0; i < this.drops.length; i++) {
      this.drops[i] += this.rates[i] * fall;
      if (this.drops[i] > rowsTall && Math.random() > 0.97) this.drops[i] = -Math.random() * 8;
    }
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    const size = this.fontSize();
    const color = this.color() || this.textColor();
    ctx.font = `${size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textBaseline = 'top';
    if (this.reduced) return this.drawStill(ctx, color, size);

    // Fade what's there towards transparent, so it works over any background
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = `rgba(0, 0, 0, ${this.fade()})`;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalCompositeOperation = 'source-over';

    // Columns whose head moved down a row: the cell it left keeps the trail color, the new head is bright
    const moved: number[] = [];
    ctx.fillStyle = color;
    for (let i = 0; i < this.drops.length; i++) {
      const row = Math.floor(this.drops[i]);
      if (row === this.rows[i] || row < 0) continue;
      ctx.clearRect(i * size, this.rows[i] * size, size, size);
      ctx.fillText(this.glyph(), i * size, this.rows[i] * size);
      this.rows[i] = row;
      moved.push(i);
    }
    if (this.highlight()) ctx.fillStyle = '#ffffff';
    for (const i of moved) ctx.fillText(this.glyph(), i * size, this.rows[i] * size);
  }

  /** Trails build up over many frames, so the reduced-motion still frame paints whole columns at once */
  private drawStill(ctx: CanvasRenderingContext2D, color: string, size: number) {
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = color;
    for (let i = 0; i < this.drops.length; i++) {
      const head = Math.floor(this.drops[i]);
      for (let k = 0; k < 14; k++) {
        ctx.globalAlpha = 1 - k / 14;
        ctx.fillText(this.glyph(), i * size, (head - k) * size);
      }
    }
    ctx.globalAlpha = 1;
  }
}
