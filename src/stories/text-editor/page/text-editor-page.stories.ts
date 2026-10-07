import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SITE_STORY, type SiteComponent } from '../../getting-started/site/site-story';

const meta: Meta<SiteComponent> = {
  title: 'Text Editor',
  // A page of the NexPrime site (text-editor-page.component.ts); the component's docs are Components/Form/Text Editor
  tags: ['np-landing'],
  ...SITE_STORY,
  args: { page: 'text-editor' },
};

export default meta;

/** Named like the title, so Storybook shows it as a single "Text Editor" page in the sidebar */
export const TextEditor: StoryObj<SiteComponent> = { name: 'Text Editor' };
