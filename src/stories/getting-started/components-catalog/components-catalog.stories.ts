import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SITE_STORY, type SiteComponent } from '../site/site-story';

const meta: Meta<SiteComponent> = {
  title: 'Components/Overview',
  // A page of the NexUI site, opened from "View Components" and not listed in the sidebar
  tags: ['!dev', 'nexui-landing'],
  ...SITE_STORY,
  args: { page: 'components-overview' },
};

export default meta;

/** Story ID components-overview--overview. The page lists components from Storybook's index.json, so new ones
 *  appear automatically */
export const Overview: StoryObj<SiteComponent> = { name: 'Overview' };
