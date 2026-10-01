import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { HelpfulComponent } from './helpful.component';

const meta: Meta<HelpfulComponent> = {
  title: 'Components/Feedback/Helpful',
  component: HelpfulComponent,
  tags: ['autodocs'],
  args: {
    question: 'Was this documentation helpful?',
    yesCount: 124,
    noCount: 18,
    voted: fn(),
    voteChange: fn(),
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
