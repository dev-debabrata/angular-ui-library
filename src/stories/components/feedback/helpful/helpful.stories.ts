import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { HELPFUL_MODES, HELPFUL_VARIANTS, HelpfulComponent } from './helpful.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<HelpfulComponent> = {
  title: 'Components/Feedback/Helpful',
  component: HelpfulComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: HELPFUL_VARIANTS },
    mode: { control: 'inline-radio', options: HELPFUL_MODES },
  },
  args: {
    question: 'Was this documentation helpful?',
    yesCount: 124,
    noCount: 18,
    voted: fn(),
    voteChange: fn(),
    rated: fn(),
    ratingChange: fn(),
    commented: fn(),
  },
};

export default meta;
type Story = StoryObj<HelpfulComponent>;

/** Click a button: the vote locks in and the count updates */
export const Default: Story = {};

export const AlreadyVoted: Story = { args: { vote: 'yes' } };

export const CustomLabels: Story = {
  args: {
    question: 'Did this answer your question?',
    yesLabel: 'Yes',
    noLabel: 'No',
    yesCount: 0,
    noCount: 0,
  },
};

/** `mode="emoji"` sets `rating` (1 to 3); with `followUp`, 😞 asks for a comment (`commented`), then shows `thanks` */
export const Emoji: Story = {
  args: { mode: 'emoji', followUp: 'What was missing?', thanks: 'Thanks, we will improve this.' },
};

/** `mode="stars"`: a 1 to 5 star rating with a hover preview */
export const Stars: Story = { args: { mode: 'stars', variant: 'pill' } };

/** Every look, on a colorful background so the glass look shows */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: HELPFUL_VARIANTS },
    template: `
      <div style="display: grid; gap: 16px; padding: 24px; border-radius: 16px; background: radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--ui-primary) 28%, transparent), transparent 55%), radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--ui-accent) 28%, transparent), transparent 55%), var(--ui-surface-muted)">
        @for (v of variants; track v) {
          <np-helpful [variant]="v" [question]="question" [yesCount]="yesCount" [noCount]="noCount" />
        }
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
