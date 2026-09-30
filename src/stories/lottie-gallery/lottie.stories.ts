/// <reference types="vite/client" />
import type { Meta, StoryObj } from '@storybook/angular-vite';

import { type GalleryAnimation, LottieGalleryComponent } from './lottie-gallery.component';

/** Every .json in src/stories/lottie, read at build time, so new files appear automatically */
const files = import.meta.glob<GalleryAnimation['data']>('../lottie/*.json', {
  import: 'default',
  eager: true,
});

const ANIMATIONS: GalleryAnimation[] = Object.entries(files)
  .map(([path, data]) => ({ name: path.split('/').pop()!.replace('.json', ''), data }))
  .sort((a, b) => a.name.localeCompare(b.name));

const meta: Meta<LottieGalleryComponent> = {
  title: 'NexLottie',
  component: LottieGalleryComponent,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    actions: { disable: true },
    a11y: { disable: true },
  },
  // Passed as props, not args, so the animation data isn't sent to the Controls panel
  render: () => ({ props: { animations: ANIMATIONS } }),
};

export default meta;

/** Named like the title, so Storybook shows it as a single "NexLottie" page in the sidebar */
export const NexLottie: StoryObj<LottieGalleryComponent> = { name: 'NexLottie' };
