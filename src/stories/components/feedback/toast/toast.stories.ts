import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { ButtonComponent } from '../../form/button/button.component';
import { TONES, type Tone } from '../../../utils/types';
import { ToastComponent } from './toast.component';

const meta: Meta<ToastComponent> = {
  title: 'Components/Feedback/Toast',
  component: ToastComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: { docs: { story: { inline: false, height: '200px' } } },
  argTypes: {
    type: { control: 'select', options: TONES },
    position: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
    },
  },
  args: {
    open: false,
    message: 'Your changes have been saved.',
    position: 'top-right',
    duration: 3000,
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
