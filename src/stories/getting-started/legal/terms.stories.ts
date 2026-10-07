import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SITE_STORY, type SiteComponent } from '../site/site-story';

const meta: Meta<SiteComponent> = {
  title: 'Terms',
  // A page of the NexPrime site, linked from the footer and not listed in the sidebar
  tags: ['!dev', 'np-landing'],
  ...SITE_STORY,
  args: { page: 'terms' },
};

export default meta;

/** Story ID terms--terms, short URL /terms */
export const Terms: StoryObj<SiteComponent> = { name: 'Terms of service' };
