import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { StarfieldComponent } from './starfield.component';

const meta: Meta<StarfieldComponent> = {
  title: 'Effects/Starfield',
  component: StarfieldComponent,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    count: { control: { type: 'range', min: 50, max: 1000, step: 25 } },
    speed: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
  },
  args: { count: 350, color: '#ffffff', speed: 1, trails: true, warpOnHover: true, steer: true },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<StarfieldComponent>;

/** Hover to jump to warp speed; the pointer steers */
export const Warp: Story = {
  render: demo('np-starfield', {
    height: '480px',
    background: BACKGROUNDS.space,
    content: heroCopy({
      title: 'Launch faster',
      text: 'Hover to engage warp drive',
      button: 'Get started',
    }),
  }),
};

/** Calm drifting dots, no streaks */
export const Calm: Story = {
  args: { trails: false, speed: 0.4, warpOnHover: false, count: 500 },
  render: demo('np-starfield', { height: '420px', background: BACKGROUNDS.black }),
};

/** Theme-colored stars on the Aurora gradient */
export const Gradient: Story = {
  args: { color: '#e0e7ff', count: 250 },
  render: demo('np-starfield', {
    height: '420px',
    background: 'var(--ui-gradient)',
    content: heroCopy({ buttonClass: 'ui-btn' }),
  }),
};
