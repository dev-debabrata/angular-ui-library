import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { ACCORDION_VARIANTS, AccordionComponent } from './accordion.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<AccordionComponent> = {
  title: 'Components/Panel/Accordion',
  component: AccordionComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ACCORDION_VARIANTS },
    toggleIcon: { control: 'inline-radio', options: ['chevron', 'plus'] },
    iconPos: { control: 'inline-radio', options: ['start', 'end'] },
  },
  args: {
    items: [
      { title: 'What is Storybook?', content: 'A tool for building UI components in isolation.' },
      { title: 'Does it work with Angular?', content: 'Yes, Storybook supports Angular.' },
      { title: 'Is it free?', content: 'Yes, Storybook is open source.' },
    ],
    expandedChange: fn(),
  },
};

export default meta;
type Story = StoryObj<AccordionComponent>;

export const Default: Story = {};

export const MultipleOpen: Story = { args: { multiple: true } };

/** Items with an `icon`, a `subtitle` or `disabled`; `[(expanded)]` opens the first */
export const IconsAndSubtitles: Story = {
  args: {
    expanded: [0],
    items: [
      ['user', 'Account', 'Profile, email and password'],
      ['credit-card', 'Billing', 'Plans and invoices'],
      ['shield', 'Security', 'Two-factor authentication'],
      ['lock', 'Enterprise SSO', 'Business plan only'],
    ].map(([icon, title, subtitle], i) => ({
      icon,
      title,
      subtitle,
      content: title,
      disabled: i > 2,
    })),
  },
};

/** Plus/minus toggle before the title */
export const PlusIcon: Story = { args: { toggleIcon: 'plus', iconPos: 'start' } };

/** Every variant, with the first section open */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: ACCORDION_VARIANTS },
    template: `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px">
      @for (v of variants; track v) {
        <div style="display: grid; gap: 8px"><code>{{ v }}</code><np-accordion [variant]="v" [items]="items" [expanded]="[0]" /></div>
      }
    </div>`,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
