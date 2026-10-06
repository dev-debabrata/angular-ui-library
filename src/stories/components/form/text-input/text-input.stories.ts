import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { TextInputComponent } from './text-input.component';
import { appearanceStories } from '../../../utils/appearance-stories';
import { FIELD_VARIANTS } from '../../../utils/types';

const meta: Meta<TextInputComponent> = {
  title: 'Components/Form/Text Input',
  component: TextInputComponent,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    variant: { control: 'select', options: FIELD_VARIANTS },
  },
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    valueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<TextInputComponent>;

export const Default: Story = {};

export const WithHint: Story = { args: { hint: "We'll never share your email." } };

export const WithError: Story = {
  args: {
    value: 'not-an-email',
    error: 'Please enter a valid email address.',
  },
};

export const Required: Story = { args: { required: true } };

/** type="password" adds a show/hide eye button */
export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    icon: 'lock',
  },
};

export const Disabled: Story = { args: { value: 'jane@example.com', disabled: true } };

/** Field styles: outlined (default), filled, underline and floating (the label sits inside and floats up) */
export const Variants: Story = {
  decorators: [moduleMetadata({ imports: [TextInputComponent] })],
  render: (args) => ({
    props: { ...args, variants: FIELD_VARIANTS },
    template: `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 28px 24px; align-items: start">
  @for (v of variants; track v) {
    <div style="display: grid; gap: 10px">
      <code style="justify-self: start; padding: 2px 8px; border-radius: 6px; background: var(--ui-surface-sunken); color: var(--ui-text-muted); font-size: 12px">{{ v }}</code>
      <np-text-input [variant]="v" label="Email" icon="mail" placeholder="you@example.com" [clearable]="true"></np-text-input>
    </div>
  }
</div>`,
  }),
};

/** A leading icon inside the field (any icon file name) */
export const WithIcon: Story = { args: { icon: 'mail' } };

/** An × button clears the value (and emits valueChange) */
export const Clearable: Story = {
  args: { clearable: true, icon: 'mail', value: 'jane@example.com' },
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
