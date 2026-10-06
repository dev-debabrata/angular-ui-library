import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { DotGridComponent } from './dot-grid.component';

const meta: Meta<DotGridComponent> = {
  title: 'Effects/Dot Grid',
  component: DotGridComponent,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    gap: { control: { type: 'range', min: 10, max: 60, step: 1 } },
    radius: { control: { type: 'range', min: 40, max: 300, step: 10 } },
    strength: { control: { type: 'range', min: 0, max: 30, step: 1 } },
  },
  args: { color: '', gap: 26, size: 1.6, radius: 130, strength: 10, ripple: true },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<DotGridComponent>;

/** Move over it to bulge the grid; click to send a ripple */
export const Default: Story = {
  render: demo('np-dot-grid', {
    height: '440px',
    background: 'var(--ui-surface-muted)',
    content: heroCopy({
      dark: false,
      title: 'Pixel perfect',
      text: 'Hover the grid, then click it',
    }),
  }),
};

/** Glowing dots on a dark page */
export const Dark: Story = {
  args: { color: '#a5b4fc', gap: 22, size: 1.4, strength: 14 },
  render: demo('np-dot-grid', {
    height: '440px',
    background: BACKGROUNDS.ink,
    content: heroCopy(),
  }),
};

/** Large, sparse dots with a wide reach */
export const Sparse: Story = {
  args: { gap: 44, size: 3, radius: 220, strength: 18, color: 'var(--ui-primary)' },
  render: demo('np-dot-grid', { height: '400px', background: 'var(--ui-surface)' }),
};
