import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { InputNumberComponent } from './input-number.component';

const meta: Meta<InputNumberComponent> = {
  title: 'Components/Form/Input Number',
  component: InputNumberComponent,
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: ['decimal', 'currency', 'percent'] },
    buttonLayout: { control: 'select', options: ['stacked', 'horizontal', 'vertical'] },
  },
  args: { label: 'Quantity', value: 1234, valueChange: fn() },
};

export default meta;
type Story = StoryObj<InputNumberComponent>;

const buttons = (
  buttonLayout: 'stacked' | 'horizontal' | 'vertical',
  args: Story['args'] = {},
): Story => ({
  args: { value: 10, showButtons: true, buttonLayout, ...args },
});

export const Default: Story = {};

export const Currency: Story = {
  args: {
    label: 'Price',
    value: 1499.5,
    mode: 'currency',
    locale: 'en-US',
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
};

/** In percent mode the value is the percentage itself: 25 is shown as 25% */
export const Percent: Story = {
  args: { label: 'Discount', value: 25, mode: 'percent', min: 0, max: 100 },
};

export const PrefixSuffix: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <np-input-number label="Weight" [value]="72.5" suffix=" kg" [maxFractionDigits]="1" />
        <np-input-number label="Budget" [value]="5000" prefix="$ " />
      </div>
    `,
  }),
};

export const MinMax: Story = {
  args: {
    label: 'Volume',
    value: 50,
    min: 0,
    max: 100,
    showButtons: true,
    hint: 'Between 0 and 100',
  },
};

export const ButtonsStacked: Story = buttons('stacked');

export const ButtonsHorizontal: Story = buttons('horizontal', { min: 0 });

export const ButtonsVertical: Story = buttons('vertical', { min: 0 });

export const Decimal: Story = {
  args: {
    label: 'Coefficient',
    value: 3.14159,
    step: 0.25,
    minFractionDigits: 2,
    maxFractionDigits: 5,
  },
};

export const Disabled: Story = { args: { disabled: true, showButtons: true } };

export const Invalid: Story = { args: { value: 150, invalid: true, hint: 'Must be 100 or less' } };
