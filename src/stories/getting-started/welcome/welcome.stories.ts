import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SITE_STORY, type SiteComponent } from '../site/site-story';

const meta: Meta<SiteComponent> = {
  title: 'Getting Started/Welcome',
  // A page of the NexUI site, full screen like a website: manager.ts hides the sidebar, toolbar and addon panel
  tags: ['nexui-landing'],
  ...SITE_STORY,
  args: { page: '' },
};

export default meta;

/** Named like the title, so Storybook shows it as a single "Welcome" page (story ID getting-started-welcome--welcome) */
export const Welcome: StoryObj<SiteComponent> = { name: 'Welcome' };
