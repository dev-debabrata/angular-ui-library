import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { MatrixRainComponent } from './matrix-rain.component';

const meta: Meta<MatrixRainComponent> = {
  title: 'Effects/Matrix Rain',
  component: MatrixRainComponent,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    fontSize: { control: { type: 'range', min: 10, max: 32, step: 1 } },
    speed: { control: { type: 'range', min: 0.2, max: 3, step: 0.1 } },
    fade: { control: { type: 'range', min: 0.02, max: 0.3, step: 0.01 } },
  },
  args: { color: '#22c55e', fontSize: 16, speed: 1, fade: 0.08, highlight: true },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<MatrixRainComponent>;

/** Classic green digital rain */
export const Default: Story = {
  render: demo('nex-matrix-rain', { height: '460px', background: BACKGROUNDS.black }),
};

/** In theme colors, behind hero content */
export const Hero: Story = {
  args: { color: '#818cf8', fade: 0.12, fontSize: 14 },
  render: demo('nex-matrix-rain', {
    height: '460px',
    background: BACKGROUNDS.ink,
    content: heroCopy({ title: 'Code that ships', text: 'Developer tools for modern teams' }),
  }),
};

/** Binary only, bigger and slower */
export const Binary: Story = {
  args: { characters: '01', fontSize: 22, speed: 0.6, color: '#38bdf8' },
  render: demo('nex-matrix-rain', { height: '400px', background: BACKGROUNDS.black }),
};
