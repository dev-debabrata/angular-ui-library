import { Component, booleanAttribute, input, numberAttribute } from '@angular/core';

import { CanvasEffect } from '../canvas-effect';

/** Lines are strokes; filled waves are translucent layers down to the bottom edge */
export type WavesVariant = 'lines' | 'filled';

export const WAVES_VARIANTS: WavesVariant[] = ['lines', 'filled'];

/** Horizontal distance between wave points in px */
const STEP = 8;

/**
 * Layered sine waves that drift sideways; they swell under the pointer.
 * With reduced motion it shows a still frame.
 */
@Component({
  selector: 'nex-waves',
  templateUrl: './waves.html',
  styleUrl: './waves.css',
})
export class WavesComponent extends CanvasEffect {
  /** Wave colors, back to front. Empty uses the theme's primary, accent and chart colors */
  readonly colors = input<string[]>([]);

  /** Number of waves */
  readonly waves = input(4, { transform: numberAttribute });

  /** Wave height in px */
  readonly amplitude = input(36, { transform: numberAttribute });

  /** Drift speed (1 = normal) */
  readonly speed = input(1, { transform: numberAttribute });

  /** Strokes or filled layers */
  readonly variant = input<WavesVariant>('lines');

  /** Raise the waves under the pointer */
  readonly interactive = input(true, { transform: booleanAttribute });

  private time = 0;
  /** 0…1: how much the pointer swell is applied (eases in and out), and where */
  private swell = 0;
  private swellX = 0;
  /** Swell at each wave point, shared by all waves */
  private lift = new Float32Array(0);

  protected seed() {
    this.time = 0;
    this.lift = new Float32Array(Math.ceil(this.width / STEP) + 2);
  }

  protected step(dt: number) {
    this.time += 0.012 * this.speed() * dt;
    this.swell += ((this.interactive() && this.pointer ? 1 : 0) - this.swell) * 0.06 * dt;
    if (this.pointer) this.swellX += (this.pointer.x - this.swellX) * 0.12 * dt;
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    const colors = this.palette(this.colors());
    const n = Math.max(1, this.waves());
    const filled = this.variant() === 'filled';
    for (let k = 0; k < this.lift.length; k++) {
      this.lift[k] =
        this.swell > 0.001
          ? 1 + 1.6 * this.swell * Math.exp(-((k * STEP - this.swellX) ** 2) / (2 * 140 ** 2))
          : 1;
    }
    ctx.lineWidth = 2;
    for (let i = 0; i < n; i++) {
      const base = this.height * (0.4 + (i / n) * 0.35);
      const freq = 0.006 + i * 0.0018;
      const phase = i * 1.7;
      const amp = this.amplitude() * (1 - i * 0.12);
      ctx.beginPath();
      for (let k = 0; k < this.lift.length; k++) {
        const x = k * STEP;
        const wave =
          Math.sin(x * freq + this.time * (1 + i * 0.3) + phase) +
          0.4 * Math.sin(x * freq * 2.3 - this.time * 1.4 + phase);
        ctx.lineTo(x, base + wave * amp * this.lift[k]);
      }
      const color = colors[i % colors.length];
      if (filled) {
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = color;
        ctx.fill();
      } else {
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = color;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
}
