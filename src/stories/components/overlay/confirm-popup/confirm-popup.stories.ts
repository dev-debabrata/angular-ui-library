import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import {
  type ConfirmDemoAction,
  ConfirmDialogDemoComponent,
} from '../confirm-dialog/confirm-dialog-demo.component';
import { ConfirmPopupComponent } from './confirm-popup.component';

/** Demo buttons are passed as props, not args, to keep them out of the Controls panel */
const actions: ConfirmDemoAction[] = [
  {
    label: 'Save',
    primary: true,
    options: { message: 'Are you sure you want to proceed?', icon: 'triangle-alert' },
  },
  {
    label: 'Delete',
    options: { message: 'Do you want to delete this record?', icon: 'info', acceptTone: 'danger' },
  },
];

const meta: Meta<ConfirmPopupComponent> = {
  title: 'Components/Overlay/Confirm Popup',
  component: ConfirmPopupComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ConfirmDialogDemoComponent] })],
  parameters: {
    docs: {
      story: { inline: false, height: '260px' },
      description: {
        component:
          'Call `inject(ConfirmationService).confirm({ target: event.currentTarget, message, accept, reject })` ' +
          'to show a confirmation anchored to the clicked element. Click outside or press Escape to reject.',
      },
    },
  },
  render: (args) => ({
    props: { ...args, actions },
    template: `<np-confirm-popup [key]="key" /><np-confirm-dialog-demo [actions]="actions" [popup]="true" />`,
  }),
};

export default meta;
type Story = StoryObj<ConfirmPopupComponent>;

export const Default: Story = {};
