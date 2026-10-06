import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { ButtonComponent } from '../../form/button/button.component';
import { TONES, type Tone } from '../../../utils/types';
import { TOAST_POSITIONS, TOAST_VARIANTS, ToastComponent } from './toast.component';

const meta: Meta<ToastComponent> = {
  title: 'Components/Feedback/Toast',
  component: ToastComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: { docs: { story: { inline: false, height: '200px' } } },
  argTypes: {
    type: { control: 'select', options: TONES },
    position: { control: 'select', options: TOAST_POSITIONS },
    variant: { control: 'select', options: TOAST_VARIANTS },
  },
  args: {
    open: false,
    message: 'Your changes have been saved.',
    position: 'top-right',
    duration: 3000,
    variant: 'default',
    openChange: fn(),
    actionClick: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <np-button label="Show toast" [primary]="true" (clicked)="open = true" />
      <np-toast
        [(open)]="open"
        [message]="message"
        [type]="type"
        [position]="position"
        [duration]="duration"
        [variant]="variant"
        [title]="title"
        [action]="action"
        [pauseOnHover]="pauseOnHover"
        [swipeable]="swipeable"
        (actionClick)="actionClick()"
      />
    `,
  }),
};

export default meta;
type Story = StoryObj<ToastComponent>;

/** Example message per type, shared by the single stories and All Types */
const MESSAGES: Record<Tone, string> = {
  success: 'Your changes have been saved.',
  info: 'A new version is available.',
  warning: 'Your session expires in 5 minutes.',
  danger: 'Failed to save changes.',
  neutral: 'Draft saved on this device.',
};

const ofType = (type: Tone): Story => ({ args: { type, message: MESSAGES[type] } });

export const Success = ofType('success');
export const Info = ofType('info');
export const Warning = ofType('warning');
/** The `danger` tone, for failures */
export const ErrorToast: Story = { ...ofType('danger'), name: 'Error' };
export const Neutral = ofType('neutral');

export const StaysOpen: Story = {
  args: { open: true, message: 'This toast stays until you close it.', duration: 0 },
};

/** Every type at once, one per corner */
export const AllTypes: Story = {
  parameters: { docs: { story: { inline: false, height: '260px' } } },
  render: () => ({
    props: {
      MESSAGES,
      corners: [
        ['success', 'top-left'],
        ['info', 'top-right'],
        ['warning', 'bottom-left'],
        ['danger', 'bottom-right'],
      ],
    },
    template: `
      @for (corner of corners; track corner[0]) {
        <np-toast [open]="true" [duration]="0" [type]="corner[0]" [position]="corner[1]" [message]="MESSAGES[corner[0]]" />
      }
    `,
  }),
};

/** A `title`, an `action` (Undo) that emits `actionClick` and closes; `pauseOnHover`, `swipeable` (drag sideways) */
export const WithAction: Story = {
  args: { open: true, title: 'Saved', action: 'Undo', pauseOnHover: true, swipeable: true },
};

/** Every look, one per position, over a colorful background so the glass look shows */
export const Variants: Story = {
  parameters: { docs: { story: { inline: false, height: '320px' } } },
  render: (args) => ({
    props: { ...args, variants: TOAST_VARIANTS, positions: TOAST_POSITIONS, tones: TONES },
    template: `
      <div style="position: fixed; inset: 0; background: radial-gradient(circle at 20% 25%, color-mix(in srgb, var(--ui-primary) 28%, transparent), transparent 55%), radial-gradient(circle at 80% 75%, color-mix(in srgb, var(--ui-accent) 28%, transparent), transparent 55%), var(--ui-surface-muted)"></div>
      @for (v of variants; track v; let i = $index) {
        <np-toast [open]="true" [duration]="0" [variant]="v" [type]="tones[i]" [position]="positions[i]" [title]="v" [message]="message" />
      }
    `,
  }),
};
