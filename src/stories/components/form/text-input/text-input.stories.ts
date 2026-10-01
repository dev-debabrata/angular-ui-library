import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { TextInputComponent } from './text-input.component';

const meta: Meta<TextInputComponent> = {
  title: 'Components/Form/Text Input',
  component: TextInputComponent,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
  },
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    valueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<TextInputComponent>;

export const Default: Story = {};

export const WithHint: Story = { args: { hint: "We'll never share your email." } };

export const WithError: Story = {
  args: {
    value: 'not-an-email',
    error: 'Please enter a valid email address.',
  },
};

export const Required: Story = { args: { required: true } };

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Disabled: Story = { args: { value: 'jane@example.com', disabled: true } };
