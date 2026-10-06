import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { MeteorsComponent } from './meteors.component';

const meta: Meta<MeteorsComponent> = {
  title: 'Effects/Meteors',
  component: MeteorsComponent,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    count: { control: { type: 'range', min: 1, max: 60, step: 1 } },
    angle: { control: { type: 'range', min: 0, max: 360, step: 5 } },
    speed: { control: { type: 'range', min: 0.2, max: 3, step: 0.1 } },
  },
  args: { count: 18, color: '', angle: 135, speed: 1 },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<MeteorsComponent>;

/** Shooting stars across a night sky */
export const NightSky: Story = {
  render: demo('np-meteors', {
    height: '480px',
    background: BACKGROUNDS.space,
    content: heroCopy({ title: 'Make a wish', text: 'Meteors streak across behind your content' }),
  }),
};

/** A meteor shower: more, faster and steeper */
export const Shower: Story = {
  args: { count: 40, speed: 1.6, angle: 115 },
  render: demo('np-meteors', { height: '420px', background: BACKGROUNDS.black }),
};

/** Theme-colored meteors on the Aurora gradient */
export const Gradient: Story = {
  args: { color: '#ffffff', angle: 150 },
  render: demo('np-meteors', {
    height: '420px',
    background: 'var(--ui-gradient)',
    content: heroCopy({ buttonClass: 'ui-btn' }),
  }),
};
