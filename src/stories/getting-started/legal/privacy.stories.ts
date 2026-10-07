import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SITE_STORY, type SiteComponent } from '../site/site-story';

const meta: Meta<SiteComponent> = {
  title: 'Privacy',
  // A page of the NexPrime site, linked from the footer and not listed in the sidebar
  tags: ['!dev', 'np-landing'],
  ...SITE_STORY,
  args: { page: 'privacy' },
};

export default meta;

/** Story ID privacy--privacy, short URL /privacy */
export const Privacy: StoryObj<SiteComponent> = { name: 'Privacy policy' };
