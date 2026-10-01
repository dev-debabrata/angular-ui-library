import { Component, booleanAttribute, input, numberAttribute } from '@angular/core';

import { CanvasEffect, type Point } from '../canvas-effect';

/** What the particles do near the pointer */
export type ParticlesInteraction = 'grab' | 'repulse' | 'attract' | 'none';

export const PARTICLES_INTERACTIONS: ParticlesInteraction[] = [
  'grab',
  'repulse',
  'attract',
  'none',
];

interface Particle extends Point {
  vx: number;
  vy: number;
  r: number;
}

/** Reference area for `count`: that many particles per 1000 × 600 px, so density stays the same at any size */
const AREA = 1000 * 600;

/** Lines are drawn in this many opacity steps, one stroke per step instead of one per line */
const BUCKETS = 8;

/**
 * Interactive "particle network" background: drifting dots joined by lines, with lines that reach for the pointer.
 * Projected content sits on top. Shows a still frame when the user prefers reduced motion.
 */
@Component({
  selector: 'nex-particles',
  templateUrl: './particles.html',
  styleUrl: './particles.css',
})
export class ParticlesComponent extends CanvasEffect {
  /** Particles per 1000 × 600 px (scaled to the element's size) */
  readonly count = input(80, { transform: numberAttribute });

  /** Dot and line color (any CSS color). Empty uses the element's text color */
  readonly color = input('');

  /** Largest dot radius in px (each dot gets a random size up to this) */
  readonly size = input(2.5, { transform: numberAttribute });

  /** Drift speed (px per frame at 60 fps) */
  readonly speed = input(0.5, { transform: numberAttribute });

  /** Join dots closer than this many px with a line */
  readonly linkDistance = input(140, { transform: numberAttribute });

  /** Line opacity at zero distance (0–1); lines fade out towards `linkDistance` */
  readonly linkOpacity = input(0.45, { transform: numberAttribute });

  /** Draw lines between dots */
  readonly links = input(true, { transform: booleanAttribute });

  /** Pointer effect: grab draws lines to it, repulse pushes dots away, attract pulls them in */
  readonly interaction = input<ParticlesInteraction>('grab');

  /** Reach of the pointer effect in px */
  readonly interactionRadius = input(160, { transform: numberAttribute });

  /** Add a few particles where the user clicks or taps */
  readonly pushOnClick = input(true, { transform: booleanAttribute });

  private particles: Particle[] = [];

  private target() {
    return Math.max(8, Math.min(400, Math.round((this.count() * this.width * this.height) / AREA)));
  }

  private particle(x: number, y: number): Particle {
    const angle = Math.random() * Math.PI * 2;
    const v = 0.4 + Math.random() * 0.6;
    const r = 0.8 + Math.random() * (this.size() - 0.8);
    return { x, y, vx: Math.cos(angle) * v, vy: Math.sin(angle) * v, r };
  }

  protected seed() {
    this.particles = Array.from({ length: this.target() }, () =>
      this.particle(Math.random() * this.width, Math.random() * this.height),
    );
  }

  protected step(dt: number) {
    const speed = this.speed() * dt;
    const mode = this.interaction();
    const radius = this.interactionRadius();
    const push = this.pointer && (mode === 'repulse' || mode === 'attract') ? this.pointer : null;
    for (const p of this.particles) {
      p.x += p.vx * speed;
      p.y += p.vy * speed;
      if (push) {
        const dx = p.x - push.x;
        const dy = p.y - push.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 0.01 && d2 < radius * radius) {
          const d = Math.sqrt(d2);
          const force = (1 - d / radius) * (mode === 'repulse' ? 4 : -1.2) * dt;
          p.x += (dx / d) * force;
          p.y += (dy / d) * force;
        }
      }
      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;
      p.x = Math.max(0, Math.min(this.width, p.x));
      p.y = Math.max(0, Math.min(this.height, p.y));
    }
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    const ps = this.particles;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = ctx.strokeStyle = this.color() || this.textColor();
    ctx.lineWidth = 1;
    const paths = Array.from({ length: BUCKETS }, () => new Path2D());
    /** Adds a line whose strength (0…1) picks its opacity step */
    const line = (strength: number, a: Point, b: Point) => {
      const path = paths[Math.min(BUCKETS - 1, Math.floor(strength * BUCKETS))];
      path.moveTo(a.x, a.y);
      path.lineTo(b.x, b.y);
    };

    if (this.links()) {
      const max = this.linkDistance();
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          if (Math.abs(dx) > max || Math.abs(dy) > max) continue;
          const d2 = dx * dx + dy * dy;
          if (d2 < max * max) line(1 - Math.sqrt(d2) / max, ps[i], ps[j]);
        }
      }
      this.strokeBuckets(ctx, paths, this.linkOpacity());
    }

    if (this.pointer && this.interaction() === 'grab') {
      const radius = this.interactionRadius();
      const grab = Array.from({ length: BUCKETS }, () => new Path2D());
      paths.splice(0, BUCKETS, ...grab);
      for (const p of ps) {
        const dx = p.x - this.pointer.x;
        const dy = p.y - this.pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < radius * radius) line(1 - Math.sqrt(d2) / radius, this.pointer, p);
      }
      this.strokeBuckets(ctx, paths, 0.8);
    }

    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    for (const p of ps) {
      ctx.moveTo(p.x + p.r, p.y);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  private strokeBuckets(ctx: CanvasRenderingContext2D, paths: Path2D[], opacity: number) {
    paths.forEach((path, k) => {
      ctx.globalAlpha = ((k + 0.5) / BUCKETS) * opacity;
      ctx.stroke(path);
    });
  }

  protected override onPointerDown({ x, y }: Point) {
    if (!this.pushOnClick()) return;
    this.particles.push(...Array.from({ length: 4 }, () => this.particle(x, y)));
    const cap = Math.max(16, this.target() * 2);
    if (this.particles.length > cap) this.particles.splice(0, this.particles.length - cap);
  }
}
