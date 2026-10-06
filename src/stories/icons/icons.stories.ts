import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SITE_STORY, type SiteComponent } from '../getting-started/site/site-story';

const meta: Meta<SiteComponent> = {
  title: 'Icons',
  // A page of the NexPrime site (icon-gallery.component.ts, data in icons-data.ts)
  tags: ['np-landing'],
  ...SITE_STORY,
  args: { page: 'icons' },
};

export default meta;

/** Named like the title, so Storybook shows it as a single "Icons" page in the sidebar */
export const Icons: StoryObj<SiteComponent> = {};
