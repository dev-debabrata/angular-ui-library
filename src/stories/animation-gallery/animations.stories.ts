/// <reference types="vite/client" />
import type { Meta, StoryObj } from '@storybook/angular-vite';

import css from '../animations.css?raw';
import { AnimationGalleryComponent, parseAnimations } from './animation-gallery.component';

/** Every nex-anim-* class in src/stories/animations.css, so new ones appear automatically */
const ANIMATIONS = parseAnimations(css);

const meta: Meta<AnimationGalleryComponent> = {
  title: 'Animations',
  component: AnimationGalleryComponent,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    actions: { disable: true },
    a11y: { disable: true },
  },
  render: () => ({ props: { animations: ANIMATIONS } }),
};

export default meta;

/** Named like the title, so Storybook shows it as a single "Animations" page in the sidebar */
export const Animations: StoryObj<AnimationGalleryComponent> = {};
