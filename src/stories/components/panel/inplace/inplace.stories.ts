import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { TextInputComponent } from '../../form/text-input/text-input.component';
import { INPLACE_VARIANTS, InplaceComponent } from './inplace.component';
import { appearanceStories } from '../../../utils/appearance-stories';

/** Wraps display + content markup in an <np-inplace> bound to the story args */
const inplace = (display: string, content: string) => `
  <np-inplace [(active)]="active" [closable]="closable" [disabled]="disabled" [variant]="variant" [icon]="icon"
    (activate)="activate()" (deactivate)="deactivate()">
    <span inplaceDisplay>${display}</span>
    ${content}
  </np-inplace>
`;

const meta: Meta<InplaceComponent> = {
  title: 'Components/Panel/Inplace',
  component: InplaceComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [TextInputComponent] })],
  argTypes: { variant: { control: 'select', options: INPLACE_VARIANTS } },
  args: { active: false, activeChange: fn(), valueChange: fn(), activate: fn(), deactivate: fn() },
  render: (args) => ({
    props: args,
    template: inplace(
      'View Content',
      `<p inplaceContent style="max-width: 480px; margin: 0; line-height: 1.6">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
      </p>`,
    ),
  }),
};

export default meta;
type Story = StoryObj<InplaceComponent>;

export const Default: Story = {};

/** Click the text to edit it, × to finish */
export const Input: Story = {
  args: { closable: true },
  render: (args) => ({
    props: { ...args, text: 'Click to edit' },
    template: inplace(
      `{{ text || 'Click to edit' }}`,
      `<np-text-input inplaceContent [(value)]="text" placeholder="Type something" />`,
    ),
  }),
};

export const Image: Story = {
  render: (args) => ({
    props: args,
    template: inplace(
      'Click to view the photo',
      `<img inplaceContent src="https://picsum.photos/360/220" alt="Random photo"
        style="display: block; border-radius: var(--ui-radius); box-shadow: var(--ui-shadow)" />`,
    ),
  }),
};

export const Closable: Story = { args: { closable: true } };

export const Disabled: Story = { args: { disabled: true } };

/** `editable`: built-in text box with save (Enter) and cancel (Escape), bound with `[(value)]` */
export const Editable: Story = {
  args: { editable: true, value: 'Quarterly report', icon: 'pencil', variant: 'underline' },
  render: (args) => ({ props: args }),
};

/** Every variant, with a pencil icon */
export const Variants: Story = {
  render: () => ({
    props: { variants: INPLACE_VARIANTS },
    template: `@for (v of variants; track v) { <np-inplace editable [variant]="v" [value]="v" icon="pencil" /> }`,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
