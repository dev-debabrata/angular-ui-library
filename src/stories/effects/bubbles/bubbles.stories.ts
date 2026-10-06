import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { demo, heroCopy } from '../effect-story';
import { BubblesComponent } from './bubbles.component';

const meta: Meta<BubblesComponent> = {
  title: 'Effects/Bubbles',
  component: BubblesComponent,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    count: { control: { type: 'range', min: 5, max: 150, step: 5 } },
    maxSize: { control: { type: 'range', min: 6, max: 50, step: 1 } },
    speed: { control: { type: 'range', min: 0.2, max: 3, step: 0.1 } },
  },
  args: { count: 40, color: '', maxSize: 18, speed: 1 },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<BubblesComponent>;

/** Bubbles rising through deep water */
export const Ocean: Story = {
  render: demo('np-bubbles', {
    height: '480px',
    background: 'linear-gradient(to bottom,#0c4a6e 0%,#082f49 60%,#020617 100%)',
    content: heroCopy({ title: 'Dive deeper', text: 'Bubbles rise behind your content' }),
  }),
};

/** Fizzy: many small, quick bubbles in the theme gradient */
export const Fizzy: Story = {
  args: { color: '#ffffff', count: 110, maxSize: 8, speed: 2 },
  render: demo('np-bubbles', {
    height: '420px',
    background: 'var(--ui-gradient)',
    content: heroCopy({ buttonClass: 'ui-btn' }),
  }),
};
