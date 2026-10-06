import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { TextareaComponent } from './textarea.component';
import { appearanceStories } from '../../../utils/appearance-stories';
import { FIELD_VARIANTS } from '../../../utils/types';

const meta: Meta<TextareaComponent> = {
  title: 'Components/Form/Textarea',
  component: TextareaComponent,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: FIELD_VARIANTS } },
  args: {
    label: 'Message',
    placeholder: 'Write your message...',
    valueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<TextareaComponent>;

export const Default: Story = {};

export const WithCounter: Story = { args: { maxLength: 200 } };

export const Disabled: Story = { args: { value: 'This textarea is disabled.', disabled: true } };

/** Field styles: outlined (default), filled, underline and floating (the label sits inside and floats up) */
export const Variants: Story = {
  decorators: [moduleMetadata({ imports: [TextareaComponent] })],
  render: (args) => ({
    props: { ...args, variants: FIELD_VARIANTS },
    template: `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 28px 24px; align-items: start">
  @for (v of variants; track v) {
    <div style="display: grid; gap: 10px">
      <code style="justify-self: start; padding: 2px 8px; border-radius: 6px; background: var(--ui-surface-sunken); color: var(--ui-text-muted); font-size: 12px">{{ v }}</code>
      <np-textarea [variant]="v" label="Message" placeholder="Write your message..." [rows]="3"></np-textarea>
    </div>
  }
</div>`,
  }),
};

/** Grows with its content instead of scrolling; `rows` is the starting height */
export const AutoResize: Story = {
  args: {
    autoResize: true,
    rows: 2,
    maxLength: 500,
    value: 'Type a few more lines: the field grows as you write.',
  },
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
