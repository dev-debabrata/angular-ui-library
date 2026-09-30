import type { Meta, StoryObj } from '@storybook/angular-vite';

import { AccordionComponent } from './accordion.component';

const meta: Meta<AccordionComponent> = {
  title: 'Components/Accordion',
  component: AccordionComponent,
  tags: ['autodocs'],
  args: {
    items: [
      { title: 'What is Storybook?', content: 'A tool for building UI components in isolation.' },
      { title: 'Does it work with Angular?', content: 'Yes, Storybook supports Angular.' },
      { title: 'Is it free?', content: 'Yes, Storybook is open source.' },
    ],
  },
};

export default meta;
type Story = StoryObj<AccordionComponent>;

export const Default: Story = {};

export const MultipleOpen: Story = { args: { multiple: true } };
