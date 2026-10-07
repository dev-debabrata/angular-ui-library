import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SITE_STORY, type SiteComponent } from '../site/site-story';

const meta: Meta<SiteComponent> = {
  title: 'Contact',
  // A page of the NexPrime site, linked from the footer and not listed in the sidebar
  tags: ['!dev', 'np-landing'],
  ...SITE_STORY,
  args: { page: 'contact' },
};

export default meta;

/** Story ID contact--contact, short URL /contact */
export const Contact: StoryObj<SiteComponent> = { name: 'Contact' };
