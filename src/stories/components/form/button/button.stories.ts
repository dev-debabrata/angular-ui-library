import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SIZES } from '../../../utils/types';
import {
  BUTTON_SEVERITIES,
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
  ButtonComponent,
} from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Form/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  argTypes: {
    severity: { control: 'select', options: ['', ...BUTTON_SEVERITIES] },
    variant: { control: 'select', options: BUTTON_VARIANTS },
    shape: { control: 'select', options: BUTTON_SHAPES },
    iconPos: { control: 'inline-radio', options: ['left', 'right'] },
    backgroundColor: { control: 'color' },
    size: { control: 'select', options: SIZES },
  },
  args: { label: 'Button', clicked: fn() },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

/** A row of buttons, one per value */
const row = (buttons: string[]) => `<div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
  ${buttons.join('\n  ')}
</div>`;

const label = (value: string) => value[0].toUpperCase() + value.slice(1);

export const Primary: Story = { args: { primary: true } };

/** `severity` sets the color */
export const Severities: Story = {
  render: () => ({
    template: row(BUTTON_SEVERITIES.map((s) => `<np-button severity="${s}" label="${label(s)}" />`)),
  }),
};

/** `variant`: solid, outlined, text and soft, in every color */
export const Variants: Story = {
  render: () => ({
    template: `<div style="display: grid; gap: 16px">
  ${BUTTON_VARIANTS.map((v) =>
    row(
      BUTTON_SEVERITIES.map((s) => `<np-button variant="${v}" severity="${s}" label="${label(s)}" />`),
    ),
  ).join('\n  ')}
</div>`,
  }),
};

/** `shape`: pill (default), rounded (small radius) or square */
export const Shapes: Story = {
  render: () => ({
    template: row([
      ...BUTTON_SHAPES.map((s) => `<np-button primary shape="${s}" label="${label(s)}" />`),
      ...BUTTON_SHAPES.map((s) => `<np-button variant="outlined" severity="help" shape="${s}" label="${label(s)}" />`),
    ]),
  }),
};

/** `icon` on either side, or icon-only with an `ariaLabel` */
export const Icons: Story = {
  render: () => ({
    template: row([
      `<np-button primary icon="check" label="Save" />`,
      `<np-button severity="secondary" icon="arrow-right" iconPos="right" label="Next" />`,
      `<np-button variant="soft" severity="danger" icon="trash-2" label="Delete" />`,
      `<np-button severity="success" icon="check" label="" ariaLabel="Confirm" />`,
      `<np-button variant="outlined" severity="help" shape="rounded" icon="heart" label="" ariaLabel="Like" />`,
      `<np-button variant="text" severity="contrast" icon="settings" label="" ariaLabel="Settings" />`,
    ]),
  }),
};

export const Loading: Story = { args: { primary: true, label: 'Saving', loading: true } };

export const Disabled: Story = { args: { primary: true, disabled: true } };

/** Every size, also with an icon */
export const Sizes: Story = {
  render: () => ({
    template: row(
      SIZES.flatMap((s) => [
        `<np-button primary size="${s}" label="${label(s)}" />`,
        `<np-button variant="soft" severity="info" size="${s}" icon="sparkles" label="${label(s)}" />`,
      ]),
    ),
  }),
};

export const Secondary: Story = {};

export const Large: Story = { args: { size: 'large' } };

export const Small: Story = { args: { size: 'small' } };
