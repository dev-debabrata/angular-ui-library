import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { ConfirmDialogComponent } from './confirm-dialog.component';
import {
  type ConfirmDemoAction,
  ConfirmDialogDemoComponent,
} from './confirm-dialog-demo.component';

const meta: Meta<ConfirmDialogComponent> = {
  title: 'Components/Confirm Dialog',
  component: ConfirmDialogComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ConfirmDialogDemoComponent] })],
  parameters: {
    docs: {
      story: { inline: false, height: '320px' },
      description: {
        component:
          'Open it from code with `inject(ConfirmationService).confirm({ message, header, accept, reject })`. ' +
          'Confirmations without a `target` show here; ones with a `target` show in ConfirmPopup.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<ConfirmDialogComponent>;

/** Demo buttons are passed as props, not args, to keep them out of the Controls panel */
const renderWith =
  (actions: ConfirmDemoAction[]): Story['render'] =>
  (args) => ({
    props: { ...args, actions },
    template: `<nex-confirm-dialog [key]="key" /><nex-confirm-dialog-demo [actions]="actions" />`,
  });

export const Default: Story = {
  render: renderWith([
    {
      label: 'Save',
      primary: true,
      options: {
        header: 'Confirmation',
        message: 'Are you sure you want to proceed?',
        icon: 'triangle-alert',
      },
    },
    {
      label: 'Delete',
      options: {
        header: 'Delete Confirmation',
        message: 'Do you want to delete this record?',
        icon: 'info',
        acceptTone: 'danger',
      },
    },
  ]),
};

export const CustomLabels: Story = {
  render: renderWith([
    {
      label: 'Leave page',
      primary: true,
      options: {
        header: 'Unsaved changes',
        message: 'You have unsaved changes. Leave without saving?',
        icon: 'circle-help',
        acceptLabel: 'Leave',
        rejectLabel: 'Stay',
        acceptTone: 'danger',
      },
    },
  ]),
};
