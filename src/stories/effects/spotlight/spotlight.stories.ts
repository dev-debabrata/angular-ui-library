import { type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { SpotlightComponent } from './spotlight.component';

const meta: Meta<SpotlightComponent> = {
  title: 'Effects/Spotlight',
  component: SpotlightComponent,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    size: { control: { type: 'range', min: 120, max: 900, step: 20 } },
  },
  args: { color: '', size: 420, dim: false },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<SpotlightComponent>;

/** A soft glow follows the pointer behind the content */
export const Glow: Story = {
  render: demo('nex-spotlight', {
    height: '460px',
    background: BACKGROUNDS.ink,
    content: heroCopy(),
  }),
};

/** Flashlight: everything outside the light is dark */
export const Flashlight: Story = {
  args: { dim: true, size: 360, color: 'rgb(255 255 255 / 0.12)' },
  render: demo('nex-spotlight', {
    height: '460px',
    background: BACKGROUNDS.night,
    content: heroCopy({
      title: 'Find what you need',
      text: 'Move the light around to explore',
      button: '',
    }),
  }),
};

/** On cards: each card lights up where the pointer is */
export const Cards: Story = {
  args: { size: 300 },
  parameters: { layout: 'padded' },
  render: (args) => ({
    props: { ...args, cards: ['Fast', 'Accessible', 'Themeable'] },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
        @for (card of cards; track card) {
          <nex-spotlight [size]="size" [color]="color"
            style="border:1px solid var(--ui-border);border-radius:var(--ui-radius-lg);background:var(--ui-surface)">
            <div style="padding:28px;font-family:var(--ui-font)">
              <h3 style="margin:0 0 6px;color:var(--ui-text)">{{ card }}</h3>
              <p style="margin:0;color:var(--ui-text-muted)">Hover me: the glow follows your pointer.</p>
            </div>
          </nex-spotlight>
        }
      </div>`,
  }),
};
