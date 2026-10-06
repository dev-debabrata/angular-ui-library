import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { TONES } from '../../../utils/types';
import { ALERT_VARIANTS, AlertComponent } from './alert.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<AlertComponent> = {
  title: 'Components/Feedback/Alert',
  component: AlertComponent,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: TONES },
    variant: { control: 'select', options: ALERT_VARIANTS },
  },
  args: { title: 'Heads up:', message: 'This is an alert message.', dismiss: fn() },
};

export default meta;
type Story = StoryObj<AlertComponent>;

export const Default: Story = {};

export const Dismissible: Story = { args: { dismissible: true } };

export const AllTypes: Story = {
  render: (args) => ({
    props: { ...args, tones: TONES },
    template: `
      <div style="display: grid; gap: 12px">
        @for (tone of tones; track tone) {
          <np-alert [type]="tone" [title]="tone + ':'" [message]="message" />
        }
      </div>
    `,
  }),
};

/** Buttons with the `alertActions` attribute; `closable` animates the alert out, then emits `dismiss` */
export const WithActions: Story = {
  render: (args) => ({
    props: args,
    template: `
      <np-alert type="warning" variant="accent" title="Update available" message="Version 2.0 is ready." closable (dismiss)="dismiss()">
        <button alertActions type="button" class="ui-btn ui-btn--primary ui-btn--sm">Install now</button>
        <button alertActions type="button" class="ui-btn ui-btn--text ui-btn--sm">Later</button>
      </np-alert>
    `,
  }),
};

/** `compact` for dense layouts, here as a full-width `banner` with a custom `icon` */
export const CompactBanner: Story = {
  args: { compact: true, variant: 'banner', icon: 'sparkles', message: 'Dark mode is here.' },
};

/** Every look, each in another tone, on a colorful background so the glass look shows */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: ALERT_VARIANTS, tones: TONES },
    template: `
      <div style="display: grid; gap: 12px; padding: 20px; border-radius: 16px; background: radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--ui-primary) 28%, transparent), transparent 55%), radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--ui-accent) 28%, transparent), transparent 55%), var(--ui-surface-muted)">
        @for (v of variants; track v; let i = $index) {
          <np-alert [variant]="v" [type]="tones[i % 5]" [title]="v" [message]="message" dismissible />
        }
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
