import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { ButtonComponent } from '../../form/button/button.component';
import { TONES } from '../../../utils/types';
import { DIALOG_POSITIONS, DIALOG_VARIANTS, DialogComponent } from './dialog.component';

const footer = `
  <div dialogFooter>
    <np-button label="Cancel" size="small" (clicked)="visible = false" />
    <np-button label="Save" size="small" [primary]="true" (clicked)="visible = false" />
  </div>
`;

/** Story template: `trigger` markup, then a dialog bound to every arg with body text and `withFooter` */
const template = (trigger: string, withFooter = footer) => `
  ${trigger}
  <np-dialog
    [visible]="visible" [header]="header" [subtitle]="subtitle" [icon]="icon" [variant]="variant" [tone]="tone"
    [modal]="modal" [closable]="closable" [dismissableMask]="dismissableMask" [maximizable]="maximizable"
    [position]="position" [width]="width" [draggable]="draggable" [blockScroll]="blockScroll"
    (visibleChange)="visible = $event; visibleChange($event)" (show)="show()" (hide)="hide()"
  >
    <p style="margin: 0">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
    </p>
    ${withFooter}
  </np-dialog>
`;

/** Story render: a button per option that sets `prop` to it and opens the dialog */
const pick =
  (prop: string, options: readonly string[]): Story['render'] =>
  (args) => ({
    props: { ...args, options },
    template: template(`<div style="display: flex; flex-wrap: wrap; gap: 8px">
      @for (o of options; track o) { <np-button [label]="o" size="small" (clicked)="${prop} = o; visible = true" /> }
    </div>`),
  });

const showButton = `<np-button label="Show dialog" [primary]="true" (clicked)="visible = true" />`;

const meta: Meta<DialogComponent> = {
  title: 'Components/Overlay/Dialog',
  component: DialogComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: { docs: { story: { inline: false, height: '420px' } } },
  argTypes: {
    position: { control: 'select', options: DIALOG_POSITIONS },
    variant: { control: 'select', options: DIALOG_VARIANTS },
    tone: { control: 'select', options: ['', ...TONES] },
  },
  args: {
    visible: false,
    header: 'Edit Profile',
    variant: 'default',
    modal: true,
    closable: true,
    dismissableMask: false,
    maximizable: false,
    position: 'center',
    width: '480px',
    visibleChange: fn(),
    show: fn(),
    hide: fn(),
  },
  render: (args) => ({ props: args, template: template(showButton) }),
};

export default meta;
type Story = StoryObj<DialogComponent>;

export const Default: Story = {};

export const Positions: Story = {
  args: { header: 'Positioned dialog', width: '360px' },
  render: pick('position', DIALOG_POSITIONS),
};

/** Hero look with a tone: a success or alert dialog with a big icon */
export const HeroTone: Story = {
  args: { header: 'Payment received', icon: 'circle-check', variant: 'hero', tone: 'success' },
};

/** Drag the header to move the dialog */
export const Draggable: Story = { args: { icon: 'grip-horizontal', draggable: true } };

export const Maximizable: Story = { args: { header: 'Maximizable dialog', maximizable: true } };

export const WithoutModal: Story = {
  args: { header: 'Non-modal dialog', modal: false },
  render: (args) => ({
    props: args,
    template: template(
      `${showButton}
      <p style="font-size: 14px; color: var(--ui-text-muted)">The page stays interactive while this dialog is open.</p>`,
      '',
    ),
  }),
};

/** Every look, with an icon and a subtitle */
export const Variants: Story = {
  args: { header: 'Invite your team', subtitle: 'Access to this workspace', icon: 'sparkles' },
  render: pick('variant', DIALOG_VARIANTS),
};
