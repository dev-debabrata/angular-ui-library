import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { CURSOR_TRAIL_SHAPES, CursorTrailComponent } from './cursor-trail.component';

const meta: Meta<CursorTrailComponent> = {
  title: 'Effects/Cursor Trail',
  component: CursorTrailComponent,
  tags: ['autodocs'],
  argTypes: {
    shape: { control: 'select', options: CURSOR_TRAIL_SHAPES },
    size: { control: { type: 'range', min: 2, max: 24, step: 1 } },
    life: { control: { type: 'range', min: 10, max: 120, step: 5 } },
    spacing: { control: { type: 'range', min: 2, max: 30, step: 1 } },
  },
  args: { colors: [], size: 7, life: 45, spacing: 6, shape: 'sparkle' },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<CursorTrailComponent>;

/** Move the pointer: sparkles follow it and fade */
export const Sparkles: Story = {
  render: demo('np-cursor-trail', {
    height: '420px',
    background: BACKGROUNDS.ink,
    content: heroCopy(),
  }),
};

/** Soft dots on a light page */
export const Dots: Story = {
  args: { shape: 'dot', size: 12, life: 30 },
  render: demo('np-cursor-trail', {
    height: '420px',
    background: 'var(--ui-surface-muted)',
    content: heroCopy({
      dark: false,
      title: 'Follow me',
      text: 'A dot trail in theme colors',
      button: '',
    }),
  }),
};

/** Rainbow sparkles that last longer */
export const Rainbow: Story = {
  args: {
    colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#8b5cf6'],
    life: 70,
    size: 9,
  },
  render: demo('np-cursor-trail', { height: '420px', background: BACKGROUNDS.black }),
};
