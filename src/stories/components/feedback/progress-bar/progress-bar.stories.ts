import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SIZES, TONES } from '../../../utils/types';
import {
  PROGRESS_BAR_VARIANTS,
  PROGRESS_LABEL_POSITIONS,
  ProgressBarComponent,
} from './progress-bar.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<ProgressBarComponent> = {
  title: 'Components/Feedback/Progress Bar',
  component: ProgressBarComponent,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    variant: { control: 'select', options: TONES },
    look: { control: 'select', options: PROGRESS_BAR_VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
    labelPosition: { control: 'inline-radio', options: PROGRESS_LABEL_POSITIONS },
    buffer: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
  args: { value: 40 },
};

export default meta;
type Story = StoryObj<ProgressBarComponent>;

export const Default: Story = {};

export const Complete: Story = { args: { value: 100, variant: 'success' } };

export const Warning: Story = { args: { value: 75, variant: 'warning' } };

export const WithoutLabel: Story = { args: { value: 60, showLabel: false } };

/** `indeterminate` loops when the progress is unknown */
export const Indeterminate: Story = { args: { indeterminate: true, label: 'Connecting…' } };

/** `buffer` shows how much is loaded ahead of the value, like a video player */
export const Buffer: Story = { args: { value: 35, buffer: 70, look: 'thin', showLabel: false } };

/** `labelPosition` top, next to the `label` caption (inside puts it on the fill), in the large `size` */
export const LabelTop: Story = {
  args: { value: 64, labelPosition: 'top', label: 'Uploading report.pdf', size: 'large' },
};

/** `circular` draws a ring with the percentage in the center */
export const Circular: Story = { args: { circular: true, size: 'large', value: 72, look: 'glow' } };

/** Every `look` (segmented has `segments` steps), with the percentage inside on gradient */
export const Variants: Story = {
  render: () => ({
    props: { looks: PROGRESS_BAR_VARIANTS },
    template: `
      <div style="display: grid; gap: 18px; max-width: 480px">
        @for (look of looks; track look) {
          <np-progress-bar [look]="look" [label]="look" [value]="35 + $index * 12" [labelPosition]="$index === 1 ? 'inside' : 'end'" />
        }
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
