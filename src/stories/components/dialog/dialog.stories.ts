import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { ButtonComponent } from '../button/button.component';
import { DIALOG_POSITIONS, DialogComponent } from './dialog.component';

const footer = `
  <div dialogFooter>
    <storybook-button label="Cancel" size="small" (onClick)="visible = false" />
    <storybook-button label="Save" size="small" [primary]="true" (onClick)="visible = false" />
  </div>
`;

/** Story template: `trigger` markup, then a dialog bound to every arg with body text and `withFooter` */
const template = (trigger: string, withFooter = footer) => `
  ${trigger}
  <nex-dialog
    [visible]="visible" [header]="header" [modal]="modal" [closable]="closable"
    [dismissableMask]="dismissableMask" [maximizable]="maximizable" [position]="position" [width]="width"
    (visibleChange)="visible = $event; visibleChange($event)" (show)="show()" (hide)="hide()"
  >
    <p style="margin: 0">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
    </p>
    ${withFooter}
  </nex-dialog>
`;

const showButton = `<storybook-button label="Show dialog" [primary]="true" (onClick)="visible = true" />`;

const meta: Meta<DialogComponent> = {
  title: 'Components/Dialog',
  component: DialogComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: { docs: { story: { inline: false, height: '420px' } } },
  argTypes: { position: { control: 'select', options: DIALOG_POSITIONS } },
  args: {
    visible: false,
    header: 'Edit Profile',
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
  render: (args) => ({
    props: { ...args, positions: DIALOG_POSITIONS },
    template: template(`
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        @for (p of positions; track p) {
          <storybook-button [label]="p" size="small" (onClick)="position = p; visible = true" />
        }
      </div>`),
  }),
};

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
