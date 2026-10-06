import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { SnowComponent } from './snow.component';

const meta: Meta<SnowComponent> = {
  title: 'Effects/Snow',
  component: SnowComponent,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    count: { control: { type: 'range', min: 10, max: 400, step: 10 } },
    wind: { control: { type: 'range', min: -2, max: 2, step: 0.1 } },
    speed: { control: { type: 'range', min: 0.2, max: 3, step: 0.1 } },
  },
  args: { count: 120, color: '', wind: 0.3, speed: 1 },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<SnowComponent>;

/** Gentle snowfall at night */
export const Snowfall: Story = {
  render: demo('np-snow', {
    height: '480px',
    background: BACKGROUNDS.night,
    content: heroCopy({
      title: 'Winter sale',
      text: 'Up to 40% off everything this week',
      button: 'Shop now',
    }),
  }),
};

/** A blizzard: dense, fast, blown sideways */
export const Blizzard: Story = {
  args: { count: 320, wind: 1.6, speed: 2 },
  render: demo('np-snow', { height: '420px', background: '#1e293b' }),
};
