import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { AuroraComponent } from './aurora.component';

const meta: Meta<AuroraComponent> = {
  title: 'Effects/Aurora',
  component: AuroraComponent,
  tags: ['autodocs'],
  argTypes: {
    speed: { control: { type: 'range', min: 0.2, max: 4, step: 0.1 } },
    blur: { control: { type: 'range', min: 20, max: 140, step: 5 } },
    opacity: { control: { type: 'range', min: 0.1, max: 1, step: 0.05 } },
  },
  args: { colors: [], speed: 1, blur: 70, opacity: 0.75, followPointer: true },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<AuroraComponent>;

/** Theme colors drifting behind dark hero content */
export const Default: Story = {
  render: demo('nex-aurora', {
    height: '480px',
    background: BACKGROUNDS.black,
    content: heroCopy(),
  }),
};

/** A light page with pastel blobs */
export const Light: Story = {
  args: { colors: ['#c7d2fe', '#fbcfe8', '#bae6fd', '#ddd6fe'], opacity: 0.9 },
  render: demo('nex-aurora', {
    height: '420px',
    background: 'var(--ui-surface)',
    content: heroCopy({
      dark: false,
      title: 'Build faster with NexUI',
      text: 'A soft aurora behind your content',
    }),
  }),
};

/** Northern lights: greens and teals, faster */
export const NorthernLights: Story = {
  args: { colors: ['#22c55e', '#14b8a6', '#0ea5e9', '#a855f7'], speed: 1.8, blur: 90 },
  render: demo('nex-aurora', {
    height: '420px',
    background: BACKGROUNDS.space,
    content: heroCopy({
      title: 'Northern Lights',
      text: 'Pure CSS, renders on the server',
      button: '',
    }),
  }),
};
