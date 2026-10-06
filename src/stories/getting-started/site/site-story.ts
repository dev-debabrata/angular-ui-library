import { type Meta, applicationConfig } from '@storybook/angular-vite';

import { SiteComponent } from './site.component';
import { SITE_PROVIDERS } from './site.routes';

/**
 * Story setup shared by the site's pages (Welcome, Components/Overview, Icons, Animations, NexLottie). Each story
 * sets `title`, `tags: ['np-landing']` (full screen, see manager.ts) and its page in `args`
 */
export const SITE_STORY = {
  component: SiteComponent,
  decorators: [applicationConfig({ providers: SITE_PROVIDERS })],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    actions: { disable: true },
    a11y: { disable: true },
  },
} satisfies Meta<SiteComponent>;

export type { SiteComponent };
