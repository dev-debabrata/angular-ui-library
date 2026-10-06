import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { STEPPER_VARIANTS, StepperComponent, type StepItem } from './stepper.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const detailed: StepItem[] = [
  { label: 'Account', description: 'Email and password', icon: 'user' },
  { label: 'Profile', description: 'Name and photo', icon: 'image' },
  { label: 'Plan', description: 'Pick a subscription', icon: 'credit-card' },
  { label: 'Done', description: 'Start using the app', icon: 'rocket' },
];

const meta: Meta<StepperComponent> = {
  title: 'Components/Panel/Stepper',
  component: StepperComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [StepperComponent] })],
  argTypes: {
    activeStep: { control: { type: 'range', min: 0, max: 4, step: 1 } },
    variant: { control: 'select', options: STEPPER_VARIANTS },
  },
  args: {
    steps: ['Cart', 'Shipping', 'Payment', 'Review'],
    activeStepChange: fn(),
  },
};

export default meta;
type Story = StoryObj<StepperComponent>;

export const FirstStep: Story = { args: { activeStep: 0 } };

export const InProgress: Story = { args: { activeStep: 2 } };

export const Completed: Story = { args: { activeStep: 4 } };

/** `variant`: circles (default), progress, dots, arrows and cards */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: STEPPER_VARIANTS },
    template: `<div style="display: grid; gap: 36px">
  @for (v of variants; track v) {
    <np-stepper [variant]="v" [steps]="steps" [activeStep]="2" />
  }
</div>`,
  }),
};

/** Steps with a description and an icon, as cards */
export const CardsWithDetails: Story = { args: { steps: detailed, activeStep: 1, variant: 'cards' } };

/** `vertical`: a timeline-style column */
export const Vertical: Story = { args: { steps: detailed, activeStep: 2, vertical: true } };

/** `vertical` dots */
export const VerticalDots: Story = {
  args: { steps: detailed, activeStep: 1, vertical: true, variant: 'dots' },
};

/** `clickable`: finished steps can be clicked to go back; [(activeStep)] follows */
export const Clickable: Story = { args: { activeStep: 3, clickable: true, variant: 'arrows' } };

/** A step with `error: true` */
export const ErrorState: Story = {
  args: {
    steps: ['Cart', 'Shipping', { label: 'Payment', description: 'Card declined', error: true }, 'Review'],
    activeStep: 2,
  },
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the InProgress example */
const appearance = appearanceStories(meta, InProgress);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
