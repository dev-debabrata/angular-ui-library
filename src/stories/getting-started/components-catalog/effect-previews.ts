import type { Type } from '@angular/core';

import { AuroraComponent } from '../../effects/aurora/aurora.component';
import { BorderBeamComponent } from '../../effects/border-beam/border-beam.component';
import { BubblesComponent } from '../../effects/bubbles/bubbles.component';
import { ConfettiComponent } from '../../effects/confetti/confetti.component';
import { CursorTrailComponent } from '../../effects/cursor-trail/cursor-trail.component';
import { DotGridComponent } from '../../effects/dot-grid/dot-grid.component';
import { DotRibbonComponent } from '../../effects/dot-ribbon/dot-ribbon.component';
import { DotWaveComponent } from '../../effects/dot-wave/dot-wave.component';
import { CanvasEffect } from '../../effects/canvas-effect';
import { BACKGROUNDS } from '../../effects/effect-story';
import { FirefliesComponent } from '../../effects/fireflies/fireflies.component';
import { FlickeringGridComponent } from '../../effects/flickering-grid/flickering-grid.component';
import { GrainComponent } from '../../effects/grain/grain.component';
import { LightRaysComponent } from '../../effects/light-rays/light-rays.component';
import { MatrixRainComponent } from '../../effects/matrix-rain/matrix-rain.component';
import { MeteorsComponent } from '../../effects/meteors/meteors.component';
import { ParticlesComponent } from '../../effects/particles/particles.component';
import { RetroGridComponent } from '../../effects/retro-grid/retro-grid.component';
import { RippleComponent } from '../../effects/ripple/ripple.component';
import { SnowComponent } from '../../effects/snow/snow.component';
import { SpotlightComponent } from '../../effects/spotlight/spotlight.component';
import { StarfieldComponent } from '../../effects/starfield/starfield.component';
import { WavesComponent } from '../../effects/waves/waves.component';

/**
 * An Effects card: the effect running on its story's background, its Lucide icon (list view, and on top while
 * `idle`: effects that show nothing until clicked or hovered), `canvas` (it extends CanvasEffect) for its group,
 * and `inputs` for the card. Counts are per 1000×600 px, so a card (about a fourteenth of that) gets a few
 * bubbles or fireflies at the defaults: the cards raise them
 */
export interface EffectPreview {
  component: Type<unknown>;
  background: string;
  icon: string;
  idle: boolean;
  canvas: boolean;
  inputs?: Record<string, unknown>;
}

const effect = (
  component: Type<unknown>,
  background: string,
  icon: string,
  { idle = false, inputs }: { idle?: boolean; inputs?: Record<string, unknown> } = {},
): EffectPreview => ({
  component,
  background,
  icon,
  idle,
  canvas: component.prototype instanceof CanvasEffect,
  inputs,
});
const idle = { idle: true };

const { black, ink, night, space } = BACKGROUNDS;
const LIGHT = 'var(--ui-surface-muted)';

/** The Effects page's cards, by effect folder (loaded with the page, see components-catalog.component.ts) */
export const EFFECT_PREVIEWS: Record<string, EffectPreview> = {
  aurora: effect(AuroraComponent, black, 'sparkles'),
  'border-beam': effect(BorderBeamComponent, ink, 'square-dashed', idle),
  bubbles: effect(BubblesComponent, 'linear-gradient(#0c4a6e, #082f49 60%, #020617)', 'droplets', {
    inputs: { count: 160, maxSize: 12 },
  }),
  confetti: effect(ConfettiComponent, LIGHT, 'party-popper', idle),
  'cursor-trail': effect(CursorTrailComponent, ink, 'mouse-pointer-2', idle),
  'dot-grid': effect(DotGridComponent, LIGHT, 'grid-3x3'),
  'dot-ribbon': effect(DotRibbonComponent, LIGHT, 'ribbon'),
  'dot-wave': effect(DotWaveComponent, LIGHT, 'audio-waveform'),
  fireflies: effect(FirefliesComponent, night, 'bug', { inputs: { count: 300 } }),
  'flickering-grid': effect(FlickeringGridComponent, LIGHT, 'layout-grid'),
  grain: effect(GrainComponent, 'var(--ui-gradient)', 'film'),
  'light-rays': effect(LightRaysComponent, ink, 'sun'),
  'matrix-rain': effect(MatrixRainComponent, black, 'binary'),
  meteors: effect(MeteorsComponent, space, 'zap'),
  particles: effect(ParticlesComponent, night, 'orbit', {
    inputs: { count: 260, linkDistance: 70 },
  }),
  'retro-grid': effect(
    RetroGridComponent,
    'linear-gradient(#020617, #1e1b4b 60%, #4c1d95)',
    'grid-2x2',
  ),
  ripple: effect(RippleComponent, LIGHT, 'circle-dot'),
  snow: effect(SnowComponent, night, 'snowflake', { inputs: { count: 400 } }),
  spotlight: effect(SpotlightComponent, ink, 'flashlight'),
  starfield: effect(StarfieldComponent, space, 'stars'),
  waves: effect(WavesComponent, ink, 'waves'),
};
