import type { Meta, StoryObj } from '@storybook/angular-vite';

import { StepperComponent } from './stepper.component';

const meta: Meta<StepperComponent> = {
  title: 'Components/Panel/Stepper',
  component: StepperComponent,
  tags: ['autodocs'],
  argTypes: {
    activeStep: {
      control: { type: 'range', min: 0, max: 4, step: 1 },
    },
  },
  args: {
    steps: ['Cart', 'Shipping', 'Payment', 'Review'],
  },
};

export default meta;
type Story = StoryObj<StepperComponent>;

export const FirstStep: Story = { args: { activeStep: 0 } };

export const InProgress: Story = { args: { activeStep: 2 } };

export const Completed: Story = { args: { activeStep: 4 } };
