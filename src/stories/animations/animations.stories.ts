import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SITE_STORY, type SiteComponent } from '../getting-started/site/site-story';

const meta: Meta<SiteComponent> = {
  title: 'Animations',
  // A page of the NexUI site (animation-gallery.component.ts, data in animations-data.ts)
  tags: ['nexui-landing'],
  ...SITE_STORY,
  args: { page: 'animations' },
};

export default meta;

/** Named like the title, so Storybook shows it as a single "Animations" page in the sidebar */
export const Animations: StoryObj<SiteComponent> = {};
