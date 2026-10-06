import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { PARTICLES_INTERACTIONS, ParticlesComponent } from './particles.component';

const meta: Meta<ParticlesComponent> = {
  title: 'Effects/Particles',
  component: ParticlesComponent,
  tags: ['autodocs'],
  argTypes: {
    interaction: { control: 'select', options: PARTICLES_INTERACTIONS },
    color: { control: 'color' },
    count: { control: { type: 'range', min: 10, max: 250, step: 5 } },
    linkDistance: { control: { type: 'range', min: 40, max: 260, step: 10 } },
    speed: { control: { type: 'range', min: 0, max: 3, step: 0.1 } },
  },
  args: {
    count: 80,
    color: '#ffffff',
    size: 2.5,
    speed: 0.5,
    linkDistance: 140,
    linkOpacity: 0.45,
    links: true,
    interaction: 'grab',
    interactionRadius: 160,
    pushOnClick: true,
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<ParticlesComponent>;

/** Move the mouse over it: lines reach out to the pointer. Click to add particles */
export const Hero: Story = {
  render: demo('np-particles', {
    height: '520px',
    background: BACKGROUNDS.night,
    content: heroCopy(),
  }),
};

/** The three pointer effects side by side: grab, repulse and attract */
export const Interactions: Story = {
  parameters: { layout: 'padded' },
  render: (args) => ({
    props: { ...args, modes: ['grab', 'repulse', 'attract'] },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px">
        @for (mode of modes; track mode) {
          <np-particles [interaction]="mode" color="#ffffff" [count]="120" [linkDistance]="110"
            style="height:280px;border-radius:var(--ui-radius-lg);background:${BACKGROUNDS.ink}">
            <div style="padding:14px 16px;color:#cbd5e1;font:600 14px var(--ui-font)">{{ mode }}</div>
          </np-particles>
        }
      </div>`,
  }),
};

/** On a light surface the dots use the theme's primary color (no [color] set) */
export const Light: Story = {
  args: { color: '' },
  render: demo('np-particles', {
    height: '420px',
    background: 'var(--ui-surface-muted)',
    content: heroCopy({
      dark: false,
      title: 'Build faster with NexPrime',
      text: 'A particle network that follows your theme',
      button: '',
    }),
  }),
};

/** White particles on the Aurora gradient */
export const Gradient: Story = {
  args: { interaction: 'repulse', count: 70 },
  render: demo('np-particles', {
    height: '460px',
    background: 'var(--ui-gradient)',
    content: heroCopy({ buttonClass: 'ui-btn' }),
  }),
};

/** No lines, many small slow dots: a night sky */
export const Starfield: Story = {
  args: {
    links: false,
    count: 220,
    size: 1.6,
    speed: 0.15,
    interaction: 'attract',
    pushOnClick: false,
  },
  render: demo('np-particles', {
    height: '420px',
    background: 'radial-gradient(ellipse at bottom,#1e3a8a 0%,#0f172a 70%)',
  }),
};

/** More particles, shorter links: a tight mesh */
export const DenseNetwork: Story = {
  args: { count: 170, linkDistance: 95, size: 1.8, speed: 0.35, color: '#a5b4fc' },
  render: demo('np-particles', { height: '420px', background: BACKGROUNDS.ink }),
};
