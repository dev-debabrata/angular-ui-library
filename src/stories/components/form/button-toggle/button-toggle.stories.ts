import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SIZES } from '../../../utils/types';
import { ButtonToggleComponent, type ToggleOption } from './button-toggle.component';

const fonts: ToggleOption<string>[] = [
  { value: 'bold', label: 'Bold' },
  { value: 'italic', label: 'Italic' },
  { value: 'underline', label: 'Underline' },
];

const align: ToggleOption<string>[] = [
  { value: 'left', icon: 'align-left', ariaLabel: 'Align left' },
  { value: 'center', icon: 'align-center', ariaLabel: 'Align center' },
  { value: 'right', icon: 'align-right', ariaLabel: 'Align right' },
  { value: 'justify', icon: 'align-justify', ariaLabel: 'Justify' },
];

const theme: ToggleOption<string>[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'monitor' },
];

const meta: Meta<ButtonToggleComponent> = {
  title: 'Components/Form/Button Toggle',
  component: ButtonToggleComponent,
  tags: ['autodocs'],
  argTypes: { size: { control: 'select', options: SIZES } },
  args: { options: fonts, value: 'bold', ariaLabel: 'Font style', valueChange: fn() },
};

export default meta;
type Story = StoryObj<ButtonToggleComponent>;

/** Pick one */
export const Default: Story = {};

/** Pick any number; the value is an array */
export const Multiple: Story = { args: { multiple: true, value: ['bold', 'italic'] } };

/** Icon-only buttons (each option sets an `ariaLabel`) */
export const IconsOnly: Story = {
  args: { options: align, value: 'left', ariaLabel: 'Text alignment' },
};

/** Icons with labels; the check mark replaces the icon when selected, so it's turned off here */
export const WithIcons: Story = {
  args: { options: theme, value: 'system', showCheck: false, ariaLabel: 'Theme' },
};

export const Vertical: Story = {
  args: { options: theme, value: 'light', vertical: true, ariaLabel: 'Theme' },
};

export const Sizes: Story = {
  render: (args) => ({
    props: { ...args, sizes: SIZES },
    template: `
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 16px">
        @for (s of sizes; track s) {
          <nex-button-toggle [options]="options" [value]="value" [size]="s" [ariaLabel]="s" />
        }
      </div>
    `,
  }),
};

export const DisabledOption: Story = {
  args: { options: [...fonts.slice(0, 2), { ...fonts[2], disabled: true }] },
};

export const Disabled: Story = { args: { disabled: true } };
