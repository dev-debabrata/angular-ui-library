import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { RippleComponent } from './ripple.component';

const meta: Meta<RippleComponent> = {
  title: 'Effects/Ripple',
  component: RippleComponent,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    rings: { control: { type: 'range', min: 2, max: 14, step: 1 } },
    size: { control: { type: 'range', min: 60, max: 400, step: 10 } },
    spacing: { control: { type: 'range', min: 20, max: 140, step: 5 } },
  },
  args: { rings: 8, size: 210, spacing: 70, color: '' },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<RippleComponent>;

/** Rings pulse out from behind the content */
export const Default: Story = {
  render: demo('np-ripple', {
    height: '480px',
    background: 'var(--ui-surface)',
    content: heroCopy({
      title: 'Now live',
      text: 'Concentric rings pulse behind your content',
      dark: false,
    }),
  }),
};

/** A radar look on a dark background */
export const Radar: Story = {
  args: { color: '#22d3ee', rings: 10, size: 120, spacing: 60 },
  render: demo('np-ripple', {
    height: '460px',
    background: BACKGROUNDS.ink,
    content: heroCopy({ button: '' }),
  }),
};
