import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { FirefliesComponent } from './fireflies.component';

const meta: Meta<FirefliesComponent> = {
  title: 'Effects/Fireflies',
  component: FirefliesComponent,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    count: { control: { type: 'range', min: 10, max: 200, step: 5 } },
    size: { control: { type: 'range', min: 1, max: 5, step: 0.2 } },
    speed: { control: { type: 'range', min: 0.2, max: 3, step: 0.1 } },
  },
  args: { count: 60, color: '', size: 2.2, speed: 1 },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<FirefliesComponent>;

/** Warm fireflies drifting at night; the pointer pushes them away */
export const Night: Story = {
  render: demo('np-fireflies', {
    height: '480px',
    background: BACKGROUNDS.night,
    content: heroCopy({
      title: 'A calm evening',
      text: 'Move the pointer to scatter the fireflies',
    }),
  }),
};

/** Theme-colored sparks, many and small */
export const Sparks: Story = {
  args: { color: '#c4b5fd', count: 140, size: 1.4, speed: 1.4 },
  render: demo('np-fireflies', { height: '420px', background: BACKGROUNDS.black }),
};
