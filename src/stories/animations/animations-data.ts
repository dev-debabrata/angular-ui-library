/// <reference types="vite/client" />
import css from '../styles/animations.css?raw';
import { parseAnimations } from './animation-gallery.component';

/** Every nex-anim-* class in src/stories/styles/animations.css, so new ones appear automatically */
export const ANIMATIONS = parseAnimations(css);
