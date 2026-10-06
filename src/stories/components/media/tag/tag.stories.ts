import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SIZES } from '../../../utils/types';
import { TAG_SEVERITIES, TAG_VARIANTS, TagComponent } from './tag.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<TagComponent> = {
  title: 'Components/Media/Tag',
  component: TagComponent,
  tags: ['autodocs'],
  argTypes: {
    severity: { control: 'select', options: TAG_SEVERITIES },
    variant: { control: 'select', options: TAG_VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
  },
  args: { value: 'New', remove: fn() },
};

export default meta;
type Story = StoryObj<TagComponent>;

export const Default: Story = {};

export const AllSeverities: Story = {
  render: (args) => ({
    props: { ...args, severities: TAG_SEVERITIES },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        @for (severity of severities; track severity) {
          <np-tag [severity]="severity" [value]="severity" [icon]="icon" [rounded]="rounded" />
        }
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <np-tag value="Primary" icon="sparkles" />
        <np-tag severity="info" value="Info" icon="info" />
        <np-tag severity="success" value="Success" icon="check" />
        <np-tag severity="warning" value="Warning" icon="triangle-alert" />
        <np-tag severity="danger" value="Danger" icon="circle-alert" />
      </div>
    `,
  }),
};

export const Rounded: Story = { args: { value: 'Rounded', rounded: true } };

/** `size` small, medium or large, here with a `count` pill */
export const LargeWithCount: Story = {
  args: { value: 'Issues', size: 'large', variant: 'soft', icon: 'bug', count: 12 },
};

/** `removable` adds a × button that hides the tag and emits `remove` */
export const Removable: Story = {
  args: { value: 'Angular', variant: 'soft', removable: true, rounded: true },
};

/** Every `variant` in every severity: default, soft, outlined, gradient and dot (a status dot) */
export const Variants: Story = {
  render: () => ({
    props: { severities: TAG_SEVERITIES, variants: TAG_VARIANTS },
    template: `
      <div style="display: grid; gap: 12px">
        @for (v of variants; track v) {
          <div style="display: flex; flex-wrap: wrap; gap: 8px">
            @for (severity of severities; track severity) {
              <np-tag [variant]="v" [severity]="severity" [value]="severity" />
            }
          </div>
        }
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
