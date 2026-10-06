import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SIZES } from '../../../utils/types';
import { SpinnerComponent } from './spinner.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<SpinnerComponent> = {
  title: 'Components/Feedback/Spinner',
  component: SpinnerComponent,
  tags: ['autodocs'],
  argTypes: { size: { control: 'select', options: SIZES } },
};

export default meta;
type Story = StoryObj<SpinnerComponent>;

export const Default: Story = {};

export const Small: Story = { args: { size: 'small' } };

export const Large: Story = { args: { size: 'large' } };

export const WithLabel: Story = { args: { label: 'Loading data...' } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
