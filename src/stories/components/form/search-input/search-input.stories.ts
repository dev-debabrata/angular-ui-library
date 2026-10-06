import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SearchInputComponent } from './search-input.component';
import { appearanceStories } from '../../../utils/appearance-stories';
import { FIELD_VARIANTS } from '../../../utils/types';

const meta: Meta<SearchInputComponent> = {
  title: 'Components/Form/Search Input',
  component: SearchInputComponent,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: FIELD_VARIANTS } },
  args: {
    search: fn(),
  },
};

export default meta;
type Story = StoryObj<SearchInputComponent>;

export const Default: Story = { args: { placeholder: 'Search...' } };

export const WithValue: Story = { args: { value: 'Angular' } };

export const Disabled: Story = { args: { disabled: true } };

/** Field styles: outlined (default), filled, underline and floating (the label sits inside and floats up) */
export const Variants: Story = {
  decorators: [moduleMetadata({ imports: [SearchInputComponent] })],
  render: (args) => ({
    props: { ...args, variants: FIELD_VARIANTS },
    template: `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 28px 24px; align-items: start">
  @for (v of variants; track v) {
    <div style="display: grid; gap: 10px">
      <code style="justify-self: start; padding: 2px 8px; border-radius: 6px; background: var(--ui-surface-sunken); color: var(--ui-text-muted); font-size: 12px">{{ v }}</code>
      <np-search-input [variant]="v" label="Search" placeholder="Search docs..." (search)="search($event)"></np-search-input>
    </div>
  }
</div>`,
  }),
};

/** Press "/" anywhere on the page (outside other fields) to focus it. A letter means Ctrl/⌘ + letter: shortcut="k" */
export const Shortcut: Story = { args: { shortcut: '/', placeholder: 'Search docs...' } };

/** Ctrl/⌘ + K, shown as a pill with np-shape-pill */
export const CommandK: Story = {
  args: { shortcut: 'k', placeholder: 'Search or jump to...' },
  render: (args) => ({
    props: args,
    template: `<np-search-input class="np-shape-pill" ${argsToTemplate(args)}></np-search-input>`,
  }),
};

/** A spinner replaces the search icon while results load */
export const Loading: Story = { args: { loading: true, value: 'Angular signals' } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
