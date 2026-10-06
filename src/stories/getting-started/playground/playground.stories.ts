import type { Meta, StoryObj } from '@storybook/angular-vite';

import { PlaygroundComponent } from './playground.component';

const meta: Meta<PlaygroundComponent> = {
  title: 'Getting Started/Playground',
  component: PlaygroundComponent,
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen', controls: { disable: true }, actions: { disable: true } },
};

export default meta;

/** Named like the title, so Storybook shows it as a single "Playground" page (story ID getting-started-playground--playground) */
export const Playground: StoryObj<PlaygroundComponent> = { name: 'Playground' };
