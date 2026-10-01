import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { TextareaComponent } from './textarea.component';

const meta: Meta<TextareaComponent> = {
  title: 'Components/Form/Textarea',
  component: TextareaComponent,
  tags: ['autodocs'],
  args: {
    label: 'Message',
    placeholder: 'Write your message...',
    valueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<TextareaComponent>;

export const Default: Story = {};

export const WithCounter: Story = { args: { maxLength: 200 } };

export const Disabled: Story = { args: { value: 'This textarea is disabled.', disabled: true } };
