import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { ButtonComponent } from '../../form/button/button.component';
import { MODAL_SIZES, MODAL_VARIANTS, ModalComponent } from './modal.component';

/** Story template: `trigger` markup, then a modal bound to every arg with `content` inside */
const template = (
  trigger = `<np-button label="Open modal" [primary]="true" (clicked)="open = true" />`,
  content = 'This is the modal content. Click outside, press Escape, or click × to close.',
) => `
  ${trigger}
  <np-modal
    [open]="open" [title]="title" [variant]="variant" [size]="size" [closeOnBackdrop]="closeOnBackdrop"
    [closeOnEscape]="closeOnEscape" (openChange)="open = $event; openChange($event)"
  >${content}</np-modal>
`;

/** Story render: a button per option that sets `prop` to it and opens the modal */
const pick =
  (prop: string, options: readonly string[]): Story['render'] =>
  (args) => ({
    props: { ...args, options },
    template: template(`<div style="display: flex; flex-wrap: wrap; gap: 8px">
      @for (o of options; track o) { <np-button [label]="o" size="small" (clicked)="${prop} = o; open = true" /> }
    </div>`),
  });

const meta: Meta<ModalComponent> = {
  title: 'Components/Overlay/Modal',
  component: ModalComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: { docs: { story: { inline: false, height: '320px' } } },
  argTypes: {
    variant: { control: 'select', options: MODAL_VARIANTS },
    size: { control: 'select', options: MODAL_SIZES },
  },
  args: {
    open: false,
    title: 'Modal Title',
    variant: 'default',
    size: 'medium',
    closeOnBackdrop: true,
    closeOnEscape: true,
    openChange: fn(),
  },
  render: (args) => ({ props: args, template: template() }),
};

export default meta;
type Story = StoryObj<ModalComponent>;

export const Default: Story = {};

export const Open: Story = { args: { open: true } };

/** Every size; full covers the screen */
export const Sizes: Story = { render: pick('size', MODAL_SIZES) };

const terms = `${'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.</p>'.repeat(12)}
  <div modalFooter>
    <np-button label="Decline" size="small" (clicked)="open = false" />
    <np-button label="Accept" size="small" [primary]="true" (clicked)="open = false" />
  </div>`;

/** Long content scrolls between a fixed header and a [modalFooter] */
export const ScrollableWithFooter: Story = {
  args: { title: 'Terms of service' },
  render: (args) => ({ props: args, template: template(undefined, terms) }),
};

/** Only the × button closes it: no backdrop click, no Escape */
export const Persistent: Story = {
  args: { title: 'Finish setup', closeOnBackdrop: false, closeOnEscape: false },
  render: (args) => ({ props: args, template: template(undefined, 'Only × closes this modal.') }),
};

/** Every look */
export const Variants: Story = { render: pick('variant', MODAL_VARIANTS) };
