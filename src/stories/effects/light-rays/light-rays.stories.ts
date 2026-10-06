import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { LightRaysComponent } from './light-rays.component';

const meta: Meta<LightRaysComponent> = {
  title: 'Effects/Light Rays',
  component: LightRaysComponent,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    rays: { control: { type: 'range', min: 1, max: 16, step: 1 } },
    spread: { control: { type: 'range', min: 10, max: 160, step: 5 } },
    duration: { control: { type: 'range', min: 2, max: 20, step: 0.5 } },
  },
  args: { rays: 7, color: '', spread: 70, duration: 8 },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<LightRaysComponent>;

/** Beams of light fan down behind a dark hero */
export const Stage: Story = {
  render: demo('np-light-rays', {
    height: '480px',
    background: BACKGROUNDS.ink,
    content: heroCopy({
      title: 'In the spotlight',
      text: 'Soft rays of light sway behind your content',
    }),
  }),
};

/** Warm sunbeams, wide and slow */
export const Sunbeams: Story = {
  args: { color: 'rgb(253 230 138 / 0.8)', rays: 10, spread: 120, duration: 14 },
  render: demo('np-light-rays', {
    height: '420px',
    background: 'linear-gradient(to bottom,#78350f 0%,#1c1917 100%)',
    content: heroCopy({ button: '' }),
  }),
};
