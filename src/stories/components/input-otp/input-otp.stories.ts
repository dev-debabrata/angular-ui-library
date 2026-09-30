import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SIZES } from '../../types';
import { InputOtpComponent } from './input-otp.component';

const meta: Meta<InputOtpComponent> = {
  title: 'Components/Input OTP',
  component: InputOtpComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
    variant: { control: 'inline-radio', options: ['box', 'underline'] },
  },
  args: { label: 'Verification code', valueChange: fn(), complete: fn() },
};

export default meta;
type Story = StoryObj<InputOtpComponent>;

export const Default: Story = {};

export const SixDigits: Story = {
  args: { length: 6, integerOnly: true, hint: 'Enter the 6-digit code we sent to your phone.' },
};

/** A line under each digit instead of a box */
export const Underline: Story = { args: { variant: 'underline', integerOnly: true } };

export const UnderlineSixDigits: Story = {
  args: { variant: 'underline', length: 6, integerOnly: true, hint: 'Enter the 6-digit code.' },
};

export const Masked: Story = { args: { label: 'PIN', mask: true, integerOnly: true } };

/** `separatorAfter: [2]` splits a 6-digit code into two groups of 3 */
export const WithSeparator: Story = { args: { length: 6, integerOnly: true, separatorAfter: [2] } };

export const Sizes: Story = {
  render: (args) => ({
    props: { ...args, sizes: SIZES },
    template: `
      <div style="display: flex; flex-direction: column; gap: 20px">
        @for (size of sizes; track size) {
          <nex-input-otp [label]="size" [size]="size" />
        }
      </div>
    `,
  }),
};

export const Invalid: Story = {
  args: { value: '1234', invalid: true, hint: 'That code is incorrect. Try again.' },
};

export const Disabled: Story = { args: { value: '12', disabled: true } };
