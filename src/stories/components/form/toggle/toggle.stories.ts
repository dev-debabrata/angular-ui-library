import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { TOGGLE_SIZES, TOGGLE_VARIANTS, ToggleComponent } from './toggle.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<ToggleComponent> = {
  title: 'Components/Form/Toggle',
  component: ToggleComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: TOGGLE_VARIANTS },
    size: { control: 'select', options: TOGGLE_SIZES },
    labelPosition: { control: 'select', options: ['right', 'left'] },
  },
  args: {
    label: 'Enable notifications',
    checkedChange: fn(),
  },
};

export default meta;
type Story = StoryObj<ToggleComponent>;

export const Off: Story = {};

export const On: Story = { args: { checked: true } };

export const Disabled: Story = { args: { disabled: true } };

const withToggle = [moduleMetadata({ imports: [ToggleComponent] })];
const grid = (rows: string) =>
  `<div style="display: grid; grid-template-columns: repeat(2, max-content); gap: 20px 48px; align-items: center">${rows}</div>`;

/** Every variant, off and on */
export const Variants: Story = {
  decorators: withToggle,
  render: () => ({
    template: grid(
      TOGGLE_VARIANTS.map(
        (v) => `<np-toggle variant="${v}" label="${v}"></np-toggle><np-toggle variant="${v}" label="${v}" [checked]="true"></np-toggle>`,
      ).join(''),
    ),
  }),
};

/** small, medium and large for every variant */
export const Sizes: Story = {
  decorators: withToggle,
  render: () => ({
    template: `<div style="display: grid; grid-template-columns: repeat(3, max-content); gap: 20px 40px; align-items: center">${TOGGLE_VARIANTS.map(
      (v) => TOGGLE_SIZES.map((s) => `<np-toggle variant="${v}" size="${s}" label="${s}" [checked]="true"></np-toggle>`).join(''),
    ).join('')}</div>`,
  }),
};

/** iOS style: wider track and a large white thumb */
export const Ios: Story = { name: 'iOS', args: { variant: 'ios', checked: true } };

/** Custom text inside the track */
export const Labeled: Story = { args: { variant: 'labeled', onLabel: 'Yes', offLabel: 'No', checked: true } };

/** Custom icons inside the thumb */
export const Icon: Story = { args: { variant: 'icon', onIcon: 'sun', offIcon: 'moon', label: 'Light mode' } };

/** The label before the switch */
export const LabelLeft: Story = { args: { labelPosition: 'left', checked: true } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the On example */
const appearance = appearanceStories(meta, On);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
