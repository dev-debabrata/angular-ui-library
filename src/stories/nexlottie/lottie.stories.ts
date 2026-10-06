import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SITE_STORY, type SiteComponent } from '../getting-started/site/site-story';

const meta: Meta<SiteComponent> = {
  title: 'NexLottie',
  // A page of the NexPrime site (lottie-gallery.component.ts, data in lottie-data.ts)
  tags: ['np-landing'],
  ...SITE_STORY,
  args: { page: 'nexlottie' },
};

export default meta;

/** Named like the title, so Storybook shows it as a single "NexLottie" page in the sidebar */
export const NexLottie: StoryObj<SiteComponent> = { name: 'NexLottie' };
