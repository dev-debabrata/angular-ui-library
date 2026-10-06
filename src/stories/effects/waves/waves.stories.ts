import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { WAVES_VARIANTS, WavesComponent } from './waves.component';

const meta: Meta<WavesComponent> = {
  title: 'Effects/Waves',
  component: WavesComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: WAVES_VARIANTS },
    waves: { control: { type: 'range', min: 1, max: 8, step: 1 } },
    amplitude: { control: { type: 'range', min: 5, max: 120, step: 1 } },
    speed: { control: { type: 'range', min: 0, max: 4, step: 0.1 } },
  },
  args: { colors: [], waves: 4, amplitude: 36, speed: 1, variant: 'lines', interactive: true },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<WavesComponent>;

/** Theme-colored lines; they swell under the pointer */
export const Lines: Story = {
  render: demo('np-waves', { height: '440px', background: BACKGROUNDS.ink, content: heroCopy() }),
};

/** Translucent layers on a light page */
export const Filled: Story = {
  args: { variant: 'filled', waves: 3, amplitude: 28 },
  render: demo('np-waves', {
    height: '420px',
    background: 'var(--ui-surface)',
    content: heroCopy({
      dark: false,
      title: 'Ride the wave',
      text: 'Layered waves behind your content',
    }),
  }),
};

/** Ocean blues, many thin waves */
export const Ocean: Story = {
  args: {
    colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe', '#ffffff'],
    waves: 6,
    amplitude: 22,
    speed: 0.7,
  },
  render: demo('np-waves', { height: '400px', background: 'linear-gradient(#0c4a6e,#082f49)' }),
};
