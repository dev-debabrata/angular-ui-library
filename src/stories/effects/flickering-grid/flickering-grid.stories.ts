import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { FlickeringGridComponent } from './flickering-grid.component';

const meta: Meta<FlickeringGridComponent> = {
  title: 'Effects/Flickering Grid',
  component: FlickeringGridComponent,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    squareSize: { control: { type: 'range', min: 1, max: 16, step: 1 } },
    gap: { control: { type: 'range', min: 1, max: 20, step: 1 } },
    flicker: { control: { type: 'range', min: 0, max: 2, step: 0.05 } },
    maxOpacity: { control: { type: 'range', min: 0.05, max: 1, step: 0.05 } },
  },
  args: { squareSize: 4, gap: 6, color: '', flicker: 0.3, maxOpacity: 0.35 },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<FlickeringGridComponent>;

/** Twinkling pixels behind a light hero, in the theme color */
export const Default: Story = {
  render: demo('np-flickering-grid', {
    height: '460px',
    background: 'var(--ui-surface)',
    content: heroCopy({ dark: false }),
  }),
};

/** Bigger, brighter squares on black, like an LED wall */
export const Led: Story = {
  args: { color: '#22d3ee', squareSize: 8, gap: 4, flicker: 0.8, maxOpacity: 0.6 },
  render: demo('np-flickering-grid', {
    height: '420px',
    background: BACKGROUNDS.black,
    content: heroCopy(),
  }),
};
