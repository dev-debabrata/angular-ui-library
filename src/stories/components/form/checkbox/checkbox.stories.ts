import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SIZES } from '../../../utils/types';
import { CHECKBOX_VARIANTS, CheckboxComponent } from './checkbox.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<CheckboxComponent> = {
  title: 'Components/Form/Checkbox',
  component: CheckboxComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: CHECKBOX_VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
  },
  args: {
    label: 'Accept terms and conditions',
    checkedChange: fn(),
    indeterminateChange: fn(),
  },
};

export default meta;
type Story = StoryObj<CheckboxComponent>;

export const Unchecked: Story = {};

export const Checked: Story = { args: { checked: true } };

/** A dash for a partly checked state; clicking clears it */
export const Indeterminate: Story = { args: { label: 'Select all', indeterminate: true } };

export const WithDescription: Story = {
  args: {
    label: 'Email notifications',
    description: 'Get an email when someone mentions you or replies to your comment.',
    checked: true,
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const Invalid: Story = { args: { invalid: true } };

/** Every variant, unchecked and checked */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: CHECKBOX_VARIANTS },
    template: `
      <div style="display: grid; gap: 16px; max-width: 420px">
        @for (v of variants; track v) {
          <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center">
            <np-checkbox [variant]="v" [label]="v" icon="sparkles" />
            <np-checkbox [variant]="v" [label]="v + ' (checked)'" icon="sparkles" [checked]="true" />
          </div>
        }
      </div>
    `,
  }),
};

/** Selectable tiles with an icon and a description, e.g. picking add-ons */
export const Cards: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; gap: 10px; max-width: 420px">
        <np-checkbox variant="card" icon="cloud" label="Cloud backup"
          description="Automatic daily backups, kept for 30 days." [checked]="true" (checkedChange)="checkedChange($event)" />
        <np-checkbox variant="card" icon="shield-check" label="Advanced security"
          description="SSO, audit logs and IP allowlists." (checkedChange)="checkedChange($event)" />
        <np-checkbox variant="card" icon="headset" label="Priority support"
          description="Replies within 2 hours, 24/7." [disabled]="true" />
      </div>
    `,
  }),
};

/** Pills that fill with the gradient and show a check, e.g. as filters */
export const Chips: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <np-checkbox variant="chip" label="Remote" icon="house" [checked]="true" (checkedChange)="checkedChange($event)" />
        <np-checkbox variant="chip" label="Full-time" [checked]="true" (checkedChange)="checkedChange($event)" />
        <np-checkbox variant="chip" label="Contract" (checkedChange)="checkedChange($event)" />
        <np-checkbox variant="chip" label="Internship" (checkedChange)="checkedChange($event)" />
      </div>
    `,
  }),
};

/** A to-do list: checked items are struck through */
export const TodoList: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; gap: 12px">
        <np-checkbox variant="todo" label="Design the onboarding flow" [checked]="true" />
        <np-checkbox variant="todo" label="Write the API docs" [checked]="true" />
        <np-checkbox variant="todo" label="Ship v2.0" (checkedChange)="checkedChange($event)" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: (args) => ({
    props: { ...args, sizes: SIZES },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: center">
        @for (s of sizes; track s) {
          <np-checkbox [size]="s" [label]="s" [checked]="true" />
        }
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Checked example */
const appearance = appearanceStories(meta, Checked);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
