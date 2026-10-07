import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SITE_STORY, type SiteComponent } from '../site/site-story';

const meta: Meta<SiteComponent> = {
  title: 'About',
  // A page of the NexPrime site, linked from the footer and not listed in the sidebar
  tags: ['!dev', 'np-landing'],
  ...SITE_STORY,
  args: { page: 'about' },
};

export default meta;

/** Story ID about--about, short URL /about */
export const About: StoryObj<SiteComponent> = { name: 'About' };
