import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { demo, heroCopy } from '../effect-story';
import { GrainComponent } from './grain.component';

const meta: Meta<GrainComponent> = {
  title: 'Effects/Grain',
  component: GrainComponent,
  tags: ['autodocs'],
  argTypes: { opacity: { control: { type: 'range', min: 0, max: 0.5, step: 0.01 } } },
  args: { opacity: 0.12, animated: true },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<GrainComponent>;

/** Film grain over the theme gradient, for a printed look */
export const Gradient: Story = {
  render: demo('np-grain', {
    height: '460px',
    background: 'var(--ui-gradient)',
    content: heroCopy({
      title: 'Crafted by hand',
      text: 'A subtle grain adds texture',
      buttonClass: 'ui-btn',
    }),
  }),
};

/** Still grain on a light page */
export const Still: Story = {
  args: { animated: false, opacity: 0.08 },
  render: demo('np-grain', {
    height: '420px',
    background: 'var(--ui-surface-muted)',
    content: heroCopy({ dark: false }),
  }),
};
