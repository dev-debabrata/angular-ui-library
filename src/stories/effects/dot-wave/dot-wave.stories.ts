import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { DotWaveComponent } from './dot-wave.component';

const meta: Meta<DotWaveComponent> = {
  title: 'Effects/Dot Wave',
  component: DotWaveComponent,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    spacing: { control: { type: 'range', min: 6, max: 30, step: 1 } },
    amplitude: { control: { type: 'range', min: 0, max: 3, step: 0.1 } },
    speed: { control: { type: 'range', min: 0, max: 3, step: 0.1 } },
    size: { control: { type: 'range', min: 0.6, max: 4, step: 0.1 } },
  },
  args: { color: '', spacing: 14, amplitude: 1, speed: 1, size: 1.8, parallax: true },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<DotWaveComponent>;

/** Dark dots rolling on a light page; move the pointer to shift the view */
export const Light: Story = {
  render: demo('np-dot-wave', { height: '460px', background: 'var(--ui-surface)' }),
};

/** Theme-colored dots on a dark hero */
export const Dark: Story = {
  args: { color: '#a5b4fc', amplitude: 1.3 },
  render: demo('np-dot-wave', {
    height: '480px',
    background: BACKGROUNDS.space,
    content: heroCopy({ title: 'Ride the wave', text: 'A 3D surface of dots behind your content' }),
  }),
};

/** Dense, small dots in calm water */
export const Calm: Story = {
  args: { spacing: 9, size: 1.2, amplitude: 0.6, speed: 0.5, color: '#0ea5e9' },
  render: demo('np-dot-wave', { height: '420px', background: 'var(--ui-surface-muted)' }),
};
