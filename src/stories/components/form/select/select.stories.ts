import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SELECT_LAYOUTS, SelectComponent } from './select.component';
import { appearanceStories } from '../../../utils/appearance-stories';
import { FIELD_VARIANTS } from '../../../utils/types';

const meta: Meta<SelectComponent> = {
  title: 'Components/Form/Select',
  component: SelectComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: FIELD_VARIANTS },
    layout: { control: 'inline-radio', options: SELECT_LAYOUTS },
  },
  args: {
    label: 'Role',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' },
    ],
    valueChange: fn(),
    valuesChange: fn(),
  },
};

export default meta;
type Story = StoryObj<SelectComponent>;

export const Default: Story = {};

export const WithValue: Story = { args: { value: 'editor' } };

export const Disabled: Story = { args: { value: 'viewer', disabled: true } };

/** Field styles: outlined (default), filled, underline and floating (the label sits inside and floats up) */
export const Variants: Story = {
  decorators: [moduleMetadata({ imports: [SelectComponent] })],
  render: (args) => ({
    props: { ...args, variants: FIELD_VARIANTS },
    template: `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 28px 24px; align-items: start">
  @for (v of variants; track v) {
    <div style="display: grid; gap: 10px">
      <code style="justify-self: start; padding: 2px 8px; border-radius: 6px; background: var(--ui-surface-sunken); color: var(--ui-text-muted); font-size: 12px">{{ v }}</code>
      <np-select [variant]="v" label="Role" icon="user" [options]="options"></np-select>
    </div>
  }
</div>`,
  }),
};

/** A leading icon inside the dropdown (any icon file name) */
export const WithIcon: Story = { args: { icon: 'briefcase', value: 'editor' } };

/** Options with an icon, a description and a disabled one; the selected option shows a check */
export const RichOptions: Story = {
  args: {
    label: 'Permission',
    value: 'edit',
    options: [
      { value: 'view', label: 'Can view', description: 'Read-only access', icon: 'eye' },
      {
        value: 'comment',
        label: 'Can comment',
        description: 'View and leave comments',
        icon: 'message-circle',
      },
      {
        value: 'edit',
        label: 'Can edit',
        description: 'Make changes to the content',
        icon: 'pencil',
      },
      {
        value: 'owner',
        label: 'Owner',
        description: 'Only one owner per project',
        icon: 'crown',
        disabled: true,
      },
    ],
  },
};

const PEOPLE = [
  ['amy', 'Amy Elsner', 'Design', 5],
  ['anna', 'Anna Fali', 'Design', 9],
  ['asiya', 'Asiya Javayant', 'Engineering', 12],
  ['bernardo', 'Bernardo Dominic', 'Engineering', 13],
  ['ioni', 'Ioni Bowcher', 'Marketing', 20],
].map(([value, label, group, img]) => ({
  value: value as string,
  label: label as string,
  group: group as string,
  description: `${group} team`,
  image: `https://i.pravatar.cc/64?img=${img}`,
}));

const LABELS = [
  ['bug', 'Bug', 'var(--ui-danger)'],
  ['feature', 'Feature', 'var(--ui-primary)'],
  ['docs', 'Docs', 'var(--ui-success)'],
  ['design', 'Design', 'var(--ui-accent)'],
  ['question', 'Question', 'var(--ui-warning)'],
].map(([value, label, color]) => ({ value, label, color }));

/** `multiple`: checkboxes in the panel (it stays open), picks as chips; options with color swatches (`color`) */
export const Multiple: Story = {
  args: {
    label: 'Labels',
    placeholder: 'Add labels',
    multiple: true,
    values: ['bug', 'docs'],
    options: LABELS,
  },
};

/** A people picker: avatar options (`image`) grouped under headings (`group`), with search */
export const People: Story = {
  args: {
    label: 'Assignee',
    placeholder: 'Assign to…',
    filter: true,
    value: 'asiya',
    options: PEOPLE,
  },
};

/** `layout: 'grid'`: tiles with large icons */
export const Grid: Story = {
  args: {
    label: 'Project type',
    layout: 'grid',
    value: 'mobile',
    options: [
      { value: 'web', label: 'Web app', icon: 'globe' },
      { value: 'mobile', label: 'Mobile', icon: 'smartphone' },
      { value: 'desktop', label: 'Desktop', icon: 'monitor' },
      { value: 'api', label: 'API', icon: 'server' },
      { value: 'design', label: 'Design', icon: 'palette' },
      { value: 'other', label: 'Other', icon: 'sparkles' },
    ],
  },
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
