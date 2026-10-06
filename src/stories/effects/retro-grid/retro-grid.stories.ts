import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { RetroGridComponent } from './retro-grid.component';

const meta: Meta<RetroGridComponent> = {
  title: 'Effects/Retro Grid',
  component: RetroGridComponent,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    angle: { control: { type: 'range', min: 30, max: 80, step: 1 } },
    cellSize: { control: { type: 'range', min: 20, max: 140, step: 5 } },
    duration: { control: { type: 'range', min: 2, max: 40, step: 1 } },
  },
  args: { angle: 65, cellSize: 60, color: '', duration: 15 },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<RetroGridComponent>;

/** Synthwave: a glowing grid scrolling towards you */
export const Synthwave: Story = {
  args: { color: 'rgb(236 72 153 / 0.6)' },
  render: demo('np-retro-grid', {
    height: '480px',
    background: 'linear-gradient(to bottom,#020617 0%,#1e1b4b 60%,#4c1d95 100%)',
    content: heroCopy({ title: 'Back to the future', text: 'A perspective grid behind your hero' }),
  }),
};

/** On a light page, in the theme color */
export const Light: Story = {
  args: { duration: 20 },
  render: demo('np-retro-grid', {
    height: '420px',
    background: 'var(--ui-surface)',
    content: heroCopy({ dark: false }),
  }),
};

/** Dark, with small fast cells */
export const Dark: Story = {
  args: { cellSize: 36, duration: 6, color: 'rgb(148 163 184 / 0.35)' },
  render: demo('np-retro-grid', {
    height: '420px',
    background: BACKGROUNDS.black,
    content: heroCopy(),
  }),
};
