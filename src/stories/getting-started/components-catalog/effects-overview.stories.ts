import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SITE_STORY, type SiteComponent } from '../site/site-story';

const meta: Meta<SiteComponent> = {
  title: 'Effects/Overview',
  // A page of the NexPrime site (the top bar's Effects link), not listed in the sidebar
  tags: ['!dev', 'np-landing'],
  ...SITE_STORY,
  args: { page: 'effects-overview' },
};

export default meta;

/** Story ID effects-overview--overview: the Components catalog over the effects, read from index.json */
export const Overview: StoryObj<SiteComponent> = { name: 'Overview' };
