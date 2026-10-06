import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';

import { BorderBeamComponent } from './border-beam.component';

const meta: Meta<BorderBeamComponent> = {
  title: 'Effects/Border Beam',
  component: BorderBeamComponent,
  tags: ['autodocs'],
  argTypes: {
    colorFrom: { control: 'color' },
    colorTo: { control: 'color' },
    size: { control: { type: 'range', min: 40, max: 400, step: 10 } },
    duration: { control: { type: 'range', min: 1, max: 20, step: 0.5 } },
    borderWidth: { control: { type: 'range', min: 1, max: 6, step: 0.5 } },
  },
  args: { size: 200, duration: 6, delay: 0, borderWidth: 1.5, colorFrom: '', colorTo: '' },
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<BorderBeamComponent>;

const card = (title: string, text: string) => `
  <div style="display:grid;gap:10px;width:340px;padding:28px;font-family:var(--ui-font)">
    <h3 style="margin:0;color:var(--ui-text)">${title}</h3>
    <p style="margin:0;color:var(--ui-text-muted);line-height:1.6">${text}</p>
    <button type="button" class="ui-btn ui-btn--primary" style="justify-self:start">Get started</button>
  </div>`;

/** A beam of light travels around a card's border */
export const Card: Story = {
  render: (args) => ({
    props: args,
    template: `
      <np-border-beam ${argsToTemplate(args)}
        style="border:1px solid var(--ui-border);border-radius:var(--ui-radius-lg);background:var(--ui-surface);box-shadow:var(--ui-shadow)">
        ${card('Pro plan', 'Everything in Free, plus unlimited projects and priority support.')}
      </np-border-beam>`,
  }),
};

/** Two beams on one card, half a trip apart, in custom colors */
export const TwoBeams: Story = {
  args: { colorFrom: '#22d3ee', colorTo: '#10b981', duration: 8 },
  render: (args) => ({
    props: args,
    template: `
      <np-border-beam ${argsToTemplate(args)}
        style="border-radius:20px;background:#0f172a;box-shadow:var(--ui-shadow-lg)">
        <np-border-beam [duration]="duration" [delay]="duration / 2" [size]="size" [borderWidth]="borderWidth"
          colorFrom="#f472b6" colorTo="#8b5cf6" style="border-radius:inherit">
          <div style="display:grid;gap:10px;width:340px;padding:28px;font-family:var(--ui-font)">
            <h3 style="margin:0;color:#fff">Live now</h3>
            <p style="margin:0;color:#cbd5e1;line-height:1.6">Two beams chase each other around the border.</p>
          </div>
        </np-border-beam>
      </np-border-beam>`,
  }),
};
