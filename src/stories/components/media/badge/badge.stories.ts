import type { Meta, StoryObj } from '@storybook/angular-vite';

import { TONES } from '../../../utils/types';
import { BadgeComponent } from './badge.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<BadgeComponent> = {
  title: 'Components/Media/Badge',
  component: BadgeComponent,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: TONES } },
  args: { label: 'New' },
};

export default meta;
type Story = StoryObj<BadgeComponent>;

export const Default: Story = {};

export const Pill: Story = { args: { label: '99+', pill: true } };

export const AllVariants: Story = {
  render: (args) => ({
    props: { ...args, tones: TONES },
    template: `
      <div style="display: flex; gap: 8px">
        @for (tone of tones; track tone) {
          <np-badge [variant]="tone" [label]="tone" [pill]="pill" />
        }
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
