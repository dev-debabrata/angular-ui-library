/// <reference types="vite/client" />
import type { Meta, StoryObj } from '@storybook/angular-vite';

import tags from '../icons/tags.json';
import { IconGalleryComponent, type GalleryIcon } from './icon-gallery.component';

/** Every .svg in src/stories/icons, read at build time, so new files appear automatically */
const files = import.meta.glob<string>('../icons/*.svg', { query: '?raw', import: 'default', eager: true });

const ICONS: GalleryIcon[] = Object.entries(files)
  .map(([path, svg]) => ({ name: path.split('/').pop()!.replace('.svg', ''), svg }))
  .sort((a, b) => a.name.localeCompare(b.name));

const meta: Meta<IconGalleryComponent> = {
  title: 'Icons',
  component: IconGalleryComponent,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    actions: { disable: true },
    a11y: { disable: true },
  },
  // Passed as props, not args, so ~2,000 SVG strings aren't sent to the Controls panel
  render: () => ({ props: { icons: ICONS, tags } }),
};

export default meta;

/** Named like the title, so Storybook shows it as a single "Icons" page in the sidebar */
export const Icons: StoryObj<IconGalleryComponent> = {};
