import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { RADIO_VARIANTS, RadioGroupComponent, type RadioOption } from './radio-group.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<RadioGroupComponent> = {
  title: 'Components/Form/Radio Group',
  component: RadioGroupComponent,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: RADIO_VARIANTS } },
  args: {
    label: 'Plan',
    options: [
      { value: 'free', label: 'Free' },
      { value: 'pro', label: 'Pro' },
      { value: 'enterprise', label: 'Enterprise' },
    ],
    value: 'free',
    valueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<RadioGroupComponent>;

export const Default: Story = {};

export const Horizontal: Story = { args: { horizontal: true } };

export const Disabled: Story = { args: { disabled: true } };

const PLANS: RadioOption[] = [
  { value: 'free', label: 'Free', description: 'For side projects. Up to 3 apps.', icon: 'sparkles' },
  { value: 'pro', label: 'Pro', description: 'For growing teams. Unlimited apps.', icon: 'rocket' },
  { value: 'enterprise', label: 'Enterprise', description: 'SSO, audit logs and priority support.', icon: 'building' },
];

/** Bordered cards with a description and an icon; the selected card gets a primary border and ring */
export const Cards: Story = { args: { variant: 'cards', horizontal: true, options: PLANS, value: 'pro' } };

/** Cards stacked in a column, with one disabled option */
export const CardsVertical: Story = {
  args: {
    variant: 'cards',
    label: 'Payment method',
    value: 'card',
    options: [
      { value: 'card', label: 'Credit card', description: 'Visa, Mastercard, Amex', icon: 'credit-card' },
      { value: 'wallet', label: 'Wallet', description: 'Apple Pay or Google Pay', icon: 'wallet' },
      { value: 'bank', label: 'Bank transfer', description: 'Takes 2-3 business days', icon: 'landmark', disabled: true },
    ],
  },
};

/** A segmented control: the selected segment uses the brand gradient */
export const Buttons: Story = {
  args: {
    variant: 'buttons',
    label: 'Billing',
    value: 'monthly',
    options: [
      { value: 'monthly', label: 'Monthly' },
      { value: 'quarterly', label: 'Quarterly' },
      { value: 'yearly', label: 'Yearly' },
    ],
  },
};

/** Pill chips; the selected chip is filled with the gradient and shows a check */
export const Chips: Story = {
  args: {
    variant: 'chips',
    label: 'Theme',
    value: 'system',
    options: [
      { value: 'light', label: 'Light', icon: 'sun' },
      { value: 'dark', label: 'Dark', icon: 'moon' },
      { value: 'system', label: 'System' },
      { value: 'high', label: 'High contrast', disabled: true },
    ],
  },
};

/** Every variant side by side */
export const Variants: Story = {
  decorators: [moduleMetadata({ imports: [RadioGroupComponent] })],
  args: { options: PLANS },
  render: (args) => ({
    props: args,
    template: `<div style="display: grid; gap: 32px; max-width: 720px">
  ${RADIO_VARIANTS.map(
    (v) => `<np-radio-group variant="${v}" label="${v}" value="pro" [options]="options" ${
      v === 'default' ? '' : 'horizontal'
    }></np-radio-group>`,
  ).join('\n  ')}
</div>`,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
