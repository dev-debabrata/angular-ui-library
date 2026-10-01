import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';

import { BACKGROUNDS, demo, heroCopy } from '../effect-story';
import { CONFETTI_TRIGGERS, ConfettiComponent } from './confetti.component';

const meta: Meta<ConfettiComponent> = {
  title: 'Effects/Confetti',
  component: ConfettiComponent,
  tags: ['autodocs'],
  argTypes: {
    trigger: { control: 'select', options: CONFETTI_TRIGGERS },
    count: { control: { type: 'range', min: 10, max: 300, step: 10 } },
    spread: { control: { type: 'range', min: 10, max: 360, step: 5 } },
    gravity: { control: { type: 'range', min: 0.2, max: 3, step: 0.1 } },
  },
  args: { colors: [], count: 90, spread: 70, gravity: 1, trigger: 'click' },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<ConfettiComponent>;

/** Click anywhere for a burst */
export const ClickAnywhere: Story = {
  render: demo('nex-confetti', {
    height: '420px',
    background: 'var(--ui-surface-muted)',
    content: heroCopy({
      dark: false,
      title: 'Click anywhere',
      text: 'Every click is a celebration',
      button: '',
    }),
    style: 'cursor:pointer',
  }),
};

/** trigger="manual": a button calls fire() on success */
export const OnSuccess: Story = {
  args: { trigger: 'manual', count: 140, spread: 100 },
  render: (args) => ({
    props: args,
    template: `
      <nex-confetti #party ${argsToTemplate(args)} style="height:420px;background:var(--ui-surface)">
        <div style="display:grid;place-items:center;height:100%;font-family:var(--ui-font);text-align:center">
          <div style="display:grid;gap:12px;justify-items:center">
            <h2 style="margin:0;color:var(--ui-text)">Payment complete</h2>
            <p style="margin:0;color:var(--ui-text-muted)">Celebrate from code with <code>fire()</code></p>
            <button type="button" class="ui-btn ui-btn--primary" (click)="party.fire()">Celebrate</button>
          </div>
        </div>
      </nex-confetti>`,
  }),
};

/** Gold and silver only, a wide fountain */
export const Gold: Story = {
  args: {
    colors: ['#facc15', '#eab308', '#fde68a', '#e5e7eb', '#cbd5e1'],
    spread: 140,
    count: 150,
  },
  render: demo('nex-confetti', {
    height: '420px',
    background: BACKGROUNDS.ink,
    content: heroCopy({ title: 'Congratulations!', text: 'Click to celebrate', button: '' }),
    style: 'cursor:pointer',
  }),
};
