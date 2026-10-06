import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SIZES } from '../../../utils/types';
import { InputOtpComponent, OTP_VARIANTS } from './input-otp.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<InputOtpComponent> = {
  title: 'Components/Form/Input OTP',
  component: InputOtpComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
    variant: { control: 'select', options: OTP_VARIANTS },
  },
  args: { label: 'Verification code', valueChange: fn(), complete: fn(), resend: fn() },
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

/** Tinted boxes without a border; `placeholder` shows a character in the empty ones */
export const Filled: Story = { args: { variant: 'filled', length: 6, integerOnly: true, placeholder: '•' } };

/** Round boxes, e.g. for a PIN */
export const Circle: Story = { args: { variant: 'circle', label: 'PIN', integerOnly: true, mask: true } };

/** One joined row of boxes, split in two groups */
export const Connected: Story = {
  args: { variant: 'connected', length: 6, integerOnly: true, separatorAfter: [2] },
};

/** `success` turns the boxes green, e.g. after the code was verified */
export const Success: Story = {
  args: { length: 6, value: '428913', success: true, hint: 'Code verified' },
};

/** `resendSeconds` adds "Resend in 0:30"; after the countdown a "Resend code" link emits `resend` */
export const ResendTimer: Story = {
  args: {
    length: 6,
    integerOnly: true,
    resendSeconds: 30,
    hint: 'We sent a code to j•••@example.com',
  },
};

/** Every variant */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: OTP_VARIANTS },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px">
        @for (v of variants; track v) {
          <np-input-otp [label]="v" [variant]="v" value="42" [length]="5" integerOnly />
        }
      </div>
    `,
  }),
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
          <np-input-otp [label]="size" [size]="size" />
        }
      </div>
    `,
  }),
};

export const Invalid: Story = {
  args: { value: '1234', invalid: true, hint: 'That code is incorrect. Try again.' },
};

export const Disabled: Story = { args: { value: '12', disabled: true } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
