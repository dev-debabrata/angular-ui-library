import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { DotRibbonComponent } from './dot-ribbon.component';

const meta: Meta<DotRibbonComponent> = {
  title: 'Effects/Dot Ribbon',
  component: DotRibbonComponent,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    spacing: { control: { type: 'range', min: 4, max: 24, step: 1 } },
    twist: { control: { type: 'range', min: 0, max: 3, step: 0.1 } },
    amplitude: { control: { type: 'range', min: 0, max: 3, step: 0.1 } },
    speed: { control: { type: 'range', min: 0, max: 3, step: 0.1 } },
    size: { control: { type: 'range', min: 0.5, max: 4, step: 0.1 } },
  },
  args: {
    color: '',
    spacing: 10,
    twist: 1,
    amplitude: 1,
    speed: 1,
    size: 1.7,
    parallax: true,
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<DotRibbonComponent>;

/** A gray ribbon of dots floating across a light page, like a footer background */
export const Light: Story = {
  render: demo('np-dot-ribbon', { height: '320px', background: 'var(--ui-surface-muted)' }),
};

/** Theme-colored ribbon behind a dark hero */
export const Dark: Story = {
  args: { color: '#a5b4fc' },
  render: demo('np-dot-ribbon', {
    height: '480px',
    background: BACKGROUNDS.space,
    content: heroCopy({
      title: 'Data in motion',
      text: 'A twisting ribbon of dots behind your content',
    }),
  }),
};

/** Strong twist and big waves */
export const Twisted: Story = {
  args: { twist: 2, amplitude: 1.6, color: '#334155', size: 1.4 },
  render: demo('np-dot-ribbon', { height: '420px', background: 'var(--ui-surface)' }),
};
