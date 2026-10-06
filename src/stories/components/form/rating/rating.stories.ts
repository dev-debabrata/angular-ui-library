import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SIZES } from '../../../utils/types';
import { RATING_VARIANTS, RatingComponent } from './rating.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<RatingComponent> = {
  title: 'Components/Form/Rating',
  component: RatingComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: RATING_VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
  },
  args: {
    valueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<RatingComponent>;

const WORDS = ['Terrible', 'Bad', 'Okay', 'Good', 'Great'];

export const Default: Story = { args: { value: 0 } };

export const WithValue: Story = { args: { value: 3 } };

export const TenStars: Story = { args: { value: 7, max: 10 } };

/** Read-only, e.g. a product's average score */
export const ReadOnly: Story = { args: { value: 4.5, readonly: true, showValue: true } };

/** `allowHalf`: the left half of a star picks n − 0.5 (arrow keys move by halves too) */
export const HalfStars: Story = { args: { value: 3.5, allowHalf: true, showValue: true } };

/** Words for each value, shown for the hovered or selected one */
export const WithLabels: Story = { args: { value: 4, labels: WORDS } };

/** `clearable`: clicking the current value again clears the rating */
export const Clearable: Story = { args: { value: 2, clearable: true } };

/** Faces from unhappy to delighted; the picked one is full color */
export const Emoji: Story = { args: { variant: 'emoji', value: 4, labels: WORDS, size: 'large' } };

/** A 1–10 scale, e.g. "How likely are you to recommend us?" */
export const NumberScale: Story = { args: { variant: 'number', max: 10, value: 8 } };

/** Segments that fill like a meter */
export const Bar: Story = {
  args: { variant: 'bar', value: 3, labels: ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'] },
};

/** Every variant */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: RATING_VARIANTS, words: WORDS },
    template: `
      <div style="display: grid; gap: 20px">
        @for (v of variants; track v) {
          <np-rating [variant]="v" [value]="4" [labels]="words" (valueChange)="valueChange($event)" />
        }
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: (args) => ({
    props: { ...args, sizes: SIZES },
    template: `
      <div style="display: grid; gap: 16px">
        @for (s of sizes; track s) {
          <np-rating [size]="s" [value]="3" />
        }
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the WithValue example */
const appearance = appearanceStories(meta, WithValue);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
