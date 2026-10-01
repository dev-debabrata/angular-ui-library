import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { ButtonComponent } from '../../form/button/button.component';
import { TONES } from '../../../utils/types';
import { ToastComponent } from './toast.component';

const meta: Meta<ToastComponent> = {
  title: 'Components/Feedback/Toast',
  component: ToastComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: { docs: { story: { inline: false, height: '200px' } } },
  argTypes: {
    type: { control: 'select', options: TONES },
    position: { control: 'select', options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'] },
  },
  args: { open: false, message: 'Your changes have been saved.', duration: 3000 },
  render: (args) => ({
    props: args,
    template: `
      <storybook-button label="Show toast" [primary]="true" (onClick)="open = true" />
      <nex-toast
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

export const Success: Story = { args: { type: 'success' } };

export const Danger: Story = { args: { type: 'danger', message: 'Failed to save changes.' } };

export const StaysOpen: Story = {
  args: { open: true, message: 'This toast stays until you close it.', duration: 0 },
};
